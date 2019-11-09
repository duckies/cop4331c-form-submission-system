import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';

BootstrapConsole.init({ module: AppModule })
  .then(({ boot }) => {
    boot(/*process.argv*/);
  })
  .catch(e => console.log('Error', e));
