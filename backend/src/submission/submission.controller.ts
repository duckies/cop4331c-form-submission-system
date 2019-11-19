import { Body, Controller, Param, Post, UploadedFiles, UseInterceptors, Get } from '@nestjs/common';
import { FindFormDto } from '../form/dto/find-form.dto';
import { AnswersDto } from './dto/create-submission.dto';
import { MulterInterceptor } from './multer.interceptor';
import { Submission } from './submission.entity';
import { SubmissionService } from './submission.service';
import { FindSubmissionDto } from './dto/find-submission.dto';

@Controller('/submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post(':id')
  @UseInterceptors(MulterInterceptor())
  create(@UploadedFiles() files, @Param() findFormDto: FindFormDto, @Body() answers: AnswersDto): Promise<Submission> {
    return this.submissionService.create(findFormDto, files, answers);
  }

  @Get(':id')
  findOne(@Param() findSubmissionDto: FindSubmissionDto): Promise<Submission> {
    return this.submissionService.findOne(findSubmissionDto.id);
  }
}
