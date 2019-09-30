# Database & TypeORM

We are utilizing a PostgreSQL database for relational data store. Nearly all features PostgreSQL uses are supported by MySQL, and some automated tests in the future could determine if the client can use MySQL if they so desire. While in a developmental environment the database is allowed to be volatile, understanding how the database schemas are actually created is important. Since we are not going to be directly interacting with the database often, this documentation mostly follows how [TypeORM](https://typeorm.io/#/) operates.

## Table of Contents

- [Entities](#entities)
- [Relations](#relations)
- [Using TypeORM](#using-typeorm)
- [QueryBuilder](#querybuilder)

## Entities

An entity is a backend representation of a schema in the database for a single table. We are going to have a `user` entity that will store the superadmin's role and hashed password. They are represented in the database by classes. The [TypeORM entity documentation](https://typeorm.io/#/entities) explains how entities are modeled well.

```TypeScript
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    isActive: boolean;

}
```

TypeORM will scan the above class and check it against the database will do one of two things:

1. If in the `ormconfig.json` file we have `synchronize: true` set, when the backend starts up it will update the database schemas to match the entity files with no interaction needed from the developer. One issue thay may arise from this is what if you create a bunch of users then update the `user.entity.ts` file to add a new column `birthday: Date` and the column is not nullable? TypeORM will throw an error because it cannot add a required column to existing users since there's no data to populate for them. During development we can simply delete all of the users and then restart the backend and it will make the change successfully. Synchronize is mostly used during development so nearly no SQL interaction is needed.
2. If `synchronize` is set to false or is missing from the `ormconfig.json` file TypeORM will notice changes to entity files but will not automatically update the database. This is generally what is done during production as it's dangerous for the client to run a database with this potentially destructive setting enabled. TypeORM ships with [migration](https://typeorm.io/#/migrations) support to solve this problem.

After you make changes to an entity or entities you run

```
typeorm migration:generate -n <name-of-change>
```

TypeORM will scan the entities against the database and create a file that includes the needed changes to be made to the database.

```TypeScript
import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRefactoringTIMESTAMP implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "post" RENAME COLUMN "title" TO "name"`);
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "post" RENAME COLUMN "name" TO "title"`); // reverts things made in "up" method
    }
}
```

Then when you run `typeorm migration:run` and it will find any migration files that have yet to be patched into the database and run the query in the `up()` function. Migrations are required during maintenance because it creates clear documentation of when a database modification needs to be made, who made it, and how to apply it or remove it.

If the latest-added migration needs to be reverted you run `typeorm migration:revert` and it runs the query in the `down()` function. Note that if any deletions were made because of either the up or down queries, the data cannot be recovered. Migrations need to be extensively tested in development before including them on a production database.

## Relations

Relations are a trickier subject when it comes to managing the database. Consider that a `Form` entity owns many `Question` entities, but if you're looking at the `Question` entity it "owns" only one `Form` entity. Similarly if you think a `Book` and `Genre` entity, books can have many genres, and a genre can have many books. One key use of relations is no matter which entity you're looking at, if it's related to another entity you can perform options on those other entities.

I imagine I will set up most of the relations as they have complex interactions in certain scenarios that will need tests. For instance, deleting a user should delete any comment entities they made on a website. However, deleting a book should not delete the genre it was using. If you are interested in learning how TypeORM uses relations, their [TypeORM Relations](https://typeorm.io/#/relations) page is a decent read. We are likely to only be using the `many-to-one` and `one-to-many` relations, documented [here](https://typeorm.io/#/many-to-one-one-to-many-relations).

## Using TypeORM

The benefit of TypeORM is not having to deal with SQL on the backend layer. NestJS mixed with TypeORM produces some special syntax. Most entities will potentially only need the C.R.U.D. actions (create, read, update, and destroy) as methods of their service layer. The following is a real-world example of an article/blog post entity:

```TypeScript
@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(
    user: User,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    const article = await this.articleRepository.create(createArticleDto);

    article.slug = slugify(createArticleDto.title, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });
    article.author = user;

    return article.save();
  }

  async findAll(
    take: number = 8,
    skip: number = 0,
  ): Promise<{ result: Article[]; total: number }> {
    const [result, total] = await this.articleRepository.findAndCount({
      order: { id: 'DESC' },
      take,
      skip,
    });

    return { result, total };
  }

  findOne(id: number): Promise<Article> {
    return this.articleRepository.findOneOrFail(id);
  }

  findBySlug(slug: string): Promise<Article> {
    return this.articleRepository.findOneOrFail({ slug });
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.articleRepository.findOneOrFail(id);

    const result = await this.articleRepository.merge(
      article,
      updateArticleDto,
    );

    return this.articleRepository.save(result);
  }

  async delete(id: number): Promise<Article> {
    const article = await this.articleRepository.findOneOrFail(id);

    return this.articleRepository.remove(article);
  }
}
```

Many of these methods can be used in other entities with some minor modifications, but the core concepts are similar:

- **Create** uses the `.create()` method. It simply takes an object holding all of the attributes necessary to create that entity. If you were missing an entity or an entity were invalid, the create method would throw an error. That's why we use a `CreateArticleDto` to ensure we have all of the necessary attributes before getting to this function. Note the the `article.author = user` line; this is setting up a relation where an article has a single author. The user has an array of articles on their end we could access as well.
- **findAll** is one of the two more common "read" operations as you typically either need them all or just one. If you simply wanted every single entity you could do `this.articleRepository.find()` and it would return everything, but that's an expensive operation. Typically when you visit websites these days they only show you a few articles and you have to visit other pages to view the rest; this method is modified to do that through pagination. The `take` argument is how many articles you want, and the `skip` argument is how many articles you want to skip over. So on page load you may ask for 8 and skip 0, the next page would ask for 8 skip 8, so on so forth. This method is also sorting the articles using the `order` property of the `findAndCount()` TypeORM method.
- **findOne** simply finds a lone article. There are two flavors of methods for doing this: `findOneOrFail(id)` and `findOne(id)`. The former will actually throw a `NotFoundException` if it cannot find the entity, which is often what we want. However, if you are, for example, checking if a form with the given name already exists, you don't want the application to throw an error when it doesn't return anything. If `findOne(id)` cannot find an entity, it simply returns undefined.
- **findBySlug** is a method unique to this layer. Articles require a unique identifier for the url and a slug is a more human readible one, e.g. `example.com/article/some-awful-news-story`. `findOneOrFail` using an object as an argument can take any of the attributes an article has, it's shorthand for `findOneOrFail({ slug: slug })`.
- **Update** is often the most complicated method in any entity with each requiring different levels of care. This method first finds the entity or throws an error if it doesn't exist. Some implementations actually try to create the entity if it doesn't exist; usually called an upsert (update-insert) method. The merge method simply throws the data from the DTO into the entity before being saved by `.save(result)`. You can call save directly on an entity like `article.save()` or on the repository and passing in a complete object `this.articleRepository.save(result)`. If you give the respository's save method an incomplete entity, such as one that is not currently in the database and lacks an ID, it will create that entity and you should be careful to ensure you actually want to create new entities.
- **Delete** is a simple method that looks up the entity or fails, then removes it from the database. There are other deletion methods but this one will return the original entity back if deletion is successful.

## QueryBuilder

There are many other useful features we may use with the TypeORM repository methods like shown above. However, they are often insufficient in complicated situations. For instance, if you want to update **every** entity that matches some criteria, or updating a relation of entities matching some criteria, you can get annoyed easily.

Our project will likely need drag-and-drop functionality on the administration panel. When a field is dragged into a new position the order of every other field is now incorrect. Saving every field individually is incredibly expensive and could anger the client. Below is an example that pushes the limits of what the repository methods are capable of.

```TypeScript
async update(id: number, updateFieldDto: UpdateFieldDto): Promise<Field> {
  const field = await this.fieldRepository.findOneOrFail(id);
  const currentPosition = field.order,
    desiredPosition = updateFieldDto.order;
  const options = updateFieldDto.options;
  // A transaction is needed to update all field positions only if the order is changed.
  // Using this method: https://blogs.wayne.edu/web/2017/03/13/updating-a-database-display-order-with-drag-and-drop-in-sql/
  if (desiredPosition && desiredPosition !== currentPosition) {
    const move = updateFieldDto.order > currentPosition ? 'down' : 'up';

    await this.fieldRepository.manager.transaction(async transactionalEntityManager => {
      field.order = 0;
      await field.save();

      if (move === 'down') {
        // Decrement items between the current position and the desired position.
        await this.fieldRepository.decrement(
          { order: Between(currentPosition + 1, desiredPosition) },
          'order',
          1,
        );
      }

      if (move === 'up') {
        // Increment items from desired position and the current position.
        await this.fieldRepository.increment(
          { order: Between(desiredPosition, currentPosition - 1) },
          'order',
          1,
        );
      }
    });
  }

  const result = this.fieldRepository.merge(field, updateFieldDto);

  return this.fieldRepository.save(result);
}
```

This example utilizes a **transation**. A transaction performs all actions successfully within them or reverts back to the original state. This is useful with banks for instance, you don't want to send money and decrement your account balance if the receiving bank does not accept it, both need to happen successfuly then both actions happen as if they were one atomic transaction. Here I want temporarily save the field at order 0 and move the others around it, but if moving the fields fails I don't want to keep the change I made to the field, the entire update method should act as if it never happened.

It's not obvious what the arguments for the `increment()` and `decrement()` function are doing either. A [QueryBuilder](https://typeorm.io/#/select-query-builder) would likely look more readable. It models the SQL methods closely and is often only necessary for complex operations like the one above, or for modified many entities at once.

```TypeScript
await this.fieldRepository
    .createQueryBuilder()
    .update(User)
    .set({ firstName: "Timber", lastName: "Saw" })
    .where("id = :id", { id: 1 })
    .execute();
```

The form may require some QueryBuilder usage like with drag-and-drop functionality, but most complex logic is likely to revolve around relations and actually creating and storing entities.
