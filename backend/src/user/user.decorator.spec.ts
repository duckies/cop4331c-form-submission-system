import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Usr } from './user.decorator';

function getParamDecoratorFactory(decorator: Function): Function {
  class Test {
    public test(@decorator() value): void {
      return value;
    }
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('User Decorator', () => {
  it('returns a user present in the request', () => {
    const user = { id: 1, hash: 'placeholder', lastUpdated: new Date() };
    const factory = getParamDecoratorFactory(Usr);
    const result = factory(null, { user });

    expect(result).toBe(user);
  });
});
