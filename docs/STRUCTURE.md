# Project Structure

The frontend and backend utilize frameworks that utilize a specialized project structure.

## Backend

The backend utilizes NestJS ([documentation](https://docs.nestjs.com/)) to provide features and structure to an ExpressJS API. It is modeled after the [Angular Architecture](https://angular.io/guide/architecture) though where Angular is a frontend component, NestJS is a backend component.

- Modules: Self-contained blocks of code. They can import functionality exported from other modules. There is at least one module in every project, the root module, and is called `app.module.ts`.
- Components: Classes that create the API endpoints and call upon services to perform specialized tasks. Components primarily deal with stitching together authentication and validators to send approved requests to services.
- Services: Classes which broadly encompass any value, function, or feature that an app needs. Instead of performing application logic in components, services allow the application to remain DRY by creating reusable functions to perform specialized actions. Database functionality is on this layer.
- Entities: Not a framework specific construct; entities are the backend representations of objects in the database. Entities are tighly coupled with the purpose of modules and are thus referenced here.

## Project Structure

The following example is of a module for a Comment entity and a User entity, to represent comments you may make on websites such as YouTube.

```
// Folder Structure
user
  - user.entity.ts
  - user.service.ts
  - user.controller.ts
  - user.module.ts
comment
  - comment.entity.ts
  - comment.service.ts
  - comment.controller.ts
  - comment.module.ts
app.module.ts
main.ts
```

As seen, each folder typically represents the entity it encompasses. Each user will require functions necessary to perform C.R.U.D. (create, read, update, and destroy) actions upon users that are made in the service layer.

## Services

Services are the most code-dominant parts of the application and perform almost all logic.

```Typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findOne(id: number): Promise<User> {
    return this.repository.findOneOrFail(id);
  }
}
```

There are a few important concepts to discuss here:

- The `@Injectable()` and `@InjectRepository(User)` lines are called decorators, and are usually used in Controllers to "inject" functionality into the class. This service is made injectable in order to inject the user repository, which is what TypeORM will use to allow us to access the database for this particular entity. You cannot access any other entity using this repository, only user entities. This keeps the code DRY and specialized.
- For those not familiar with TypeScript, the things after the colons are types not unlike Java types. It allows your IDE to know what the repository is supposed to be (a repository of type user), and that the `id` argument must be a number. If you try to use the `id` argument in a function that required a string input, or did not return a Promise of type User, an error would be thrown and the code would not compile. This protects you from using functions and arguments in ways that they are not supposed to.
- Promises are like an IOU in syncronous code. It allows the application to continue running while it waits for this action to complete. They are not complicated to grasp and will be easier to understand by example later on.

The primary advantage of TypeScript cannot be seen looking at its code. However, if you were writing the above `findOne()` function, when you started to type this.repository, it would have shown you all of the methods you're allowed to use on user entities. Unlike regular intellisense you may have seen in other languages, this contextually is aware of the members of objects, so for instance:

```
return this.repository.find({ name: 'Bob' });
```

This line of code would show an error in your IDE if we did not define users to have a name. It would throw an error similar to `"'name' does not exist in type FindConditions<User>`, because it knows you cannot lookup information about a user using an attribute that doesn't exist.

## Controllers

Controllers allow the frontend to access the backend through API endpoints. They never directly interact with the database but instead the service layer for that entity. It can access multiple services if necessary.

```TypeScript
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto)
  }
}
```

The `@Controller('user')` decorator signifies that all API enpoints in this controller start with `/user`. So if our API were `api.forms.com`, we'd request user information from `api.forms.com/user`. Similarly, to find an individual user by id, we'd use `api.forms.com/user/1`. The `findOne` method in this example controller directly accesses the `findOne` method created in the service layer.

The `create()` method uses a specialized decorator called `@Body()`, it accepts JSON data to be sent along the request. Our application will utilize a validator across the entire application that checks these decorators for a DTO, or a data transfer object. The DTO may look something like this:

```Typescript
export class CreateUserDto {
  @IsDefined()
  @IsString()
  readonly name: string;

  @IsDefined()
  @IsNumber()
  readonly ssn: number;

  @IsDefined()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly address: string;
}
```

DTOs use specialized decorators and libraries provided by NestJS to ensure the structure of the data being received to the backend conforms to the DTO's rules. Data that is not conforming to these rules will throw an error and the backend will disallow the request from reaching the service layer. This protects the database and other aspects of the application. For instance, if you made a request to create a user but neglected to include a name the response would throw a `BadRequestException`. You could include an address, or not include an address, and it wouldn't care. However, if you included an attribute we did not allow (even optionally), like password, the request would also throw an error, or we could set it to simply delete attributes we did not permit.

If the DTO passes validation, `create()` method in the above example would receive a CreateUserDto object with `{ name, ssn, email }` and optionally address members to access that data.

## Modules

While controllers and services can have varying degrees of functionality, modules are strictly structural.

```TypeScript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UserModule],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
```

The above are examples of two module files with the appropriate members:

1. Imports are only for importing other modules which export providers you need. You cannot import a provider, such as importing UserService or CommentService. `TypeOrmModule.forFeature([])` is the most common module import as it is what injects the database connection into the service. When we get into database modeling we will find relations allow us access related entities (e.g., users own many comments, a comment owns one user) without needing to use the service layer of a different entity, so importing other entity modules is not necessary or desired. Outside of the database ORM, it's only typical to import modules that focus on a generalized feature that all other modules will need, e.g. an authentication module.
2. Providers import services, as providers "provide" the functionality. Services are a generic name for many different kinds of files. For instance, a `user.scheduler.ts` file is not a service file and it could run user operations on a timer and would be considered a provider.
3. Controllers are simply controllers, and there can be multiple controllers per module if it makes sense. For instance, if we had a `user.scheduler.ts` file that created timed functions, we could have a `user-scheduler.controller.ts` file that creates timed events through the API that we don't want to co-mingle with the regular user controller.
4. Exports are providers we wish to export. A real-world example would be an `AuthModule` exporting an `AuthGuard` provider. Guards in NestJS are special decorators for controllers that allow or disallow entry based on some context. An AuthGuard would check if the user is logged in or not and only allow them if they were, and that is functionality that will need to be imported by many modules.

Keep in mind modules do have one extra decorator, the `@Global()` decorator. Modules with this decorator only have to be imported once and are then available to **all** other modules, typically imported in the root application module. An authentication module is typically made global, but most aren't.
