# Project Structure

The frontend and backend utilize frameworks that utilize a specialized project structure. Each will require a certain level of adherence and best practices to make our project go smoothly. Not all aspects of the framework structures are necessary to understand as the familiar group members can provide assistance with the structural requirements as needed.

## Table of Contents

- [Backend Structure](#backend-structure)
  - [Services](#services)
  - [Controllers](#controllers)
  - [Modules](#modules)
- [Frontend Structure](#frontend-structure)

## Backend Structure

The backend utilizes NestJS ([documentation](https://docs.nestjs.com/)) to provide features and structure to an ExpressJS API. It is modeled after the [Angular Architecture](https://angular.io/guide/architecture) though where Angular is a frontend component, NestJS is a backend component. The two takeaways from this documentation is that the backend is modular and each module should contain all files for that module and that module alone.

- Modules: Self-contained blocks of code. They can import functionality exported from other modules. There is at least one module in every project, the root module, and is called `app.module.ts`.
- Components: Classes that create the API endpoints and call upon services to perform specialized tasks. Components primarily deal with stitching together authentication and validators to send approved requests to services.
- Services: Classes which broadly encompass any value, function, or feature that an app needs. Instead of performing application logic in components, services allow the application to remain DRY by creating reusable functions to perform specialized actions. Database functionality is on this layer.
- Entities: Not a framework specific construct; entities are the backend representations of objects in the database. Entities are tighly coupled with the purpose of modules and are thus referenced here.

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

## Frontend Structure

The frontend utilizes [NuxtJS](https://nuxtjs.org/) on top of [Vue.js](https://vuejs.org/). Unlike the backend where the only major structural components are modules, NuxtJS ties certain functonalities into strict folder and file naming requirements. The top level directories for the frontend each has specialized functionality that cannot be modified without breaking functionality.

### Vue.js

NuxtJS is a framework that builds on Vue.js like how NestJS for the backend builds on Express.js. NestJS completely overrides how Express.js structurally and functionally operates in so many ways it's easy to not know that NestJS uses Express.js at all. NuxtJS on the other hand utilizes Vue in a much more vanilla way and applies most of its functionality on the compilation step and folder structure. One reason to choose Vue is because it's easy to digest when looking at it, but data binding and the different modifiers present in the HTML are topics much larger than this small introduction guide can handle.

To that end, learning NuxtJS is learning Vue with some structural caveats. Vue is a simple library that brings reactive components to the web that has a file structure as shown:

![VueJS Single File Compoents](https://vuejs.org/images/vue-component.png)

Modifiying `greeting` in the above image either programmatically or manually causes an instantaneous update of the text rendered in the browser. This not only applies to data, but other components can be rendered programmatically based on data using conditional HTML templating. The single and only building block within Vue is the component. We are likely to have a `FormGenerator` component that receives a form schema from the backend like so:

```HTML
<form-generator :schema="formSchema">
```

We can then also pass in a data object that we want to store answers to the form questions that it emit back to us. We call `:schema` and `:data` [props](https://vuejs.org/v2/guide/components-props.html), but can be thought of as arguments a function would take.

```HTML
<form-generator :schema="formSchema" :data="formData">
```

The `form-generator` component will take the schema and create all of the form fields based on how the superuser constructed the form, it may look something like this:

```HTML
<template>
  <v-card v-for="field in schema" :key="field.id">
    <v-card-title>{{ field.question }}</v-card-title>

    <v-card-text>
      <component :is="field.fieldType" />
    </v-card-text>
  </v-card>
</template>

<script>
export enum FieldType {
  TEXTAREA: 'TextArea',
  TEXTINPUT: 'TextInput',
  DIALOG: 'Dialog',
  CHECKBOX: 'Checkbox',
  FILEUPLOAD: 'FileUpload'
}

export interface Field {
  id: number
  fieldType: string
}

@Component({
  components: { TextArea, TextInput, Dialog, Checkbox, FileUpload }
})
export default class FormGenerator extends Vue {
  @Prop() schema!: Field[]
  @Prop() data!: any
}
</script>
```

The above example does not deal with data whatsoever, but if this `FormGenerator` component were passed an array of fields it would loop through the entire array of fields and dynamically render a component for the type desired. `v-for="field in schema"` is a looping operation that will repeat that tag and everything within it; it requires a `:key="field.id"` or some other unique identifier or Vue can get confused as it doesn't know if it's already rendered that specific component or not. All of our fields will come with unique ids, however some data does not have unique identifiers can the following could also be done: `v-for="(field, index) in schem" :key="index"`.

The information in the script tag is mostly TypeScript jargon but also the `@Prop()` declarations for data it should receive. There are many ways of defining props, and one thing this component would need to be careful of is ensuring the schema data is a required property.

> I am not certain if we should use TypeScript for the frontend. NuxtJS and Vue support it, but with the way the data manipulation works nearly all of the features require a lot of extra finesse to setup properly. I can try both methods in separate branches and investigate.

## NuxtJS Specific Architecture

Standalone Vue.js could have a single component operate as a page layout with many components within it before reaching a page component, and a page component would have many specialized components unique to that page. NuxtJS tries to provide some structural support to Vue instead of a component heirarchical hell and does so through a `Layouts`, `Pages`, and `Components` directories. I will not go over the `Assets, Middleware, Plugins, and Static` directories as they have ample explanation at the link above and are not necessary to use for creating pages. The NuxtJS documentation is quite sufficient in explaining the [directory structure](https://nuxtjs.org/guide/directory-structure).

The frontend is mostly comprised of the following, but keep in mind they are all components:

1. **Layouts** are used to provide a backbone structure to pages of a similar type. Pages which share a same structural layout will not need to repeat code elsewhere, e.g. the navigation bar or footer code. A page can specify which layout it is using.
2. **Pages** are components assigned to a specific URL designated by folder structure. The `index.vue` file is essentially the `index.html` of the website and cannot be renamed. Similarly, an `about.vue` file in the pages directory would route to `example.com/about`. More interestingly are pages with query parameters, for instance, what if you wanted to look at the page of an individual user? There are many techniques, but a popular one is to create a folder called `user` in the pages directory and within it a `index.vue` and `_id.vue` file. If you visit `example.com/user` it would take you to the `user/index.vue` page file, but if you visited `example.com/user/1` it would take you to the `user/_id.vue` page. How we want users to navigate the site has a direct impact on how our pages will be modeled and named.
3. **Components** are essentially Vue.js components in a folder of whatever structure you see fit. We'd likely have a `form` folder within the `components` folder that has our fields like `TextArea.vue`, `FileUpload.vue`, ...etc, but otherwise they are manually imported by pages and layouts and do not need to be in any strict structure.

## Vuetify

Although Vue provides an amazing amount of functionality through its reactivity and component structures it also creates an issue of having to create components of nearly all reusable things. Instead of using just HTML tags and some CSS, you have to deal with all of the boilerplate of passing data from a child component to a parent component which is tedious. [Vuetify](https://vuetifyjs.com/en/getting-started/quick-start) is one of a few libraries that provides reusable components for common elements so we don't have to make them as well as some structural supports for creating responsive pages without us having to deal with breakpoints and all of that.

Some rather important components that Vuetify provides:

- [AppBar](https://vuetifyjs.com/en/components/app-bars): The navigation menu of the site with responsive pullout menu.
- [Buttons](https://vuetifyjs.com/en/components/buttons): Like any regular old button, but adds support for disabling and showing loading status to the user.
- [Cards](https://vuetifyjs.com/en/components/cards): A versatile component that is essentially a blank panel that can be used for structure or design.
- [Dialogs](https://vuetifyjs.com/en/components/dialogs): A popup menu asking the user a question or informing them of something. Likely needed for the admin panel.
- [TextAreas](https://vuetifyjs.com/en/components/textarea): One of many form related input fields we will need. Has many utility features for displaying errors and validating input.

## Vuex

Vuex is a method for dealing with data a little more eloquently than the default data binding method. A component typically sends data to its parent by "emitting" it on some event which then that parent may decide to emit to its parent and so on so forth. This chaining is delicate, easily frustrating if something goes wrong, and also upsets some design principles because a page then has to have a ton of logic on getting and sending API requests, handling errors, and so on.

Vuex allows for the creation of many isolated "stores" that hold a **state**, **getters**, **mutations**, and **actions**. A state is like a bucket with specific information you put into it, getters are methods that simply return a state object's value (perhaps with some parsing), mutations modify state values, and actions perform API requests and commit mutations to to act upon the state. One key thing about the state is it cannot be directly modified, only through mutations.

```TypeScript
export const state: UserState = () => ({
  status: 'unloaded',
  user: {},
  token: ''
})

export const getters = {
  status(state: UserState): string {
    return state.status
  },
  user(state: UserState) {
    return state.user
  },
  isAuthenticated(state: UserState): boolean {
    return !!state.token
  }
}

export const mutations = {
  setStatus(state: UserState, status: string): void {
    state.status = status
  },
  setUser(state: UserState, user: User): void {
    state.user = user
  },
  setToken(state: UserState, token: string): void {
    state.token = token
  },
  logout(state: UserState): void {
    state.token = ''
    state.user = {}
    someMethodThatDeletesOurCookie()
  }
}

export const actions = {
  async getUser({ commit }): Promise<void> {
    commit('setStatus', 'loading')

    try {
      const data = await this.$axios.$get('/user/me')

      commit('setStatus', 'success')
      commit('setUser', resp)
    } catch (error) {
      commit('setStatus', 'error')
      if (error.status === '401') {
        commit('logout')
      }
      commit('addError', error)
  }
}
```

This rather verbose example illustrates how a vuex file would be structured. All layouts, pages, and components have easy access to calling the actions of a state and reading the getters. This provides a centrilized location for data to be stored and modified cleanly without having to pass it around delicately.

One problem with this approach is it is not TypeScript friendly. A page dispatches an action using a method possibly written as `await this.$store.dispatch('user/getUser')`. It uses a magic string to find the appropriate store and the method. It provides an easier way to access the method for regular JavaScript, but TypeScript has no way of determining what this function maps to and thus all Vuex related data, ergo all data, lacks TypeScript support. There are some libraries that do fix this but it is not well documented in support with NuxtJS so it would have to be explored carefully.

> \*The above example is a 50/50 amalgamation of a TypeScript and a regular JavaScript Vuex state file.
