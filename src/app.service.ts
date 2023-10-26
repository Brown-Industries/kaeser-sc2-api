import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // const jobOp = new CreateJobOperationDto();
    // jobOp.vendor = 'V1';
    // console.log(jobOp);

    // validate(jobOp).then((errors) => {
    //   if (errors.length > 0) {
    //     console.log('Validation failed. Errors:', errors);
    //   } else {
    //     console.log('Validation succeeded.');
    //   }
    // });

    return 'Hello World!';

    //return 'Hello World!';
  }
}
