import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SearchSensorDto } from './dto/search-sensor.dto';

@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Post()
  create(@Body(ValidationPipe) createSensorDto: CreateSensorDto) {
    return this.sensorsService.create(createSensorDto);
  }

  @Get()
  findAll() {
    return this.sensorsService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.sensorsService.findOne(uuid);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.sensorsService.findByCode(code);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body(ValidationPipe) updateSensorDto: UpdateSensorDto,
  ) {
    return this.sensorsService.update(uuid, updateSensorDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.sensorsService.remove(uuid);
  }

  @Post(':uuid/increment-events')
  incrementEvents(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.sensorsService.incrementEvents(uuid);
  }

  @Post(':uuid/increment-shutdowns')
  incrementShutdowns(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.sensorsService.incrementShutdowns(uuid);
  }

  @Post('search')
  search(@Body(ValidationPipe) searchSensorDto: SearchSensorDto) {
    return this.sensorsService.search(searchSensorDto);
  }
}