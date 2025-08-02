import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventDto } from './dto/search-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body(ValidationPipe) createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.eventsService.findByDateRange(
        new Date(startDate),
        new Date(endDate),
      );
    }
    return this.eventsService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.eventsService.findOne(uuid);
  }

  @Get('sensor/:sensorUuid')
  findBySensor(
    @Param('sensorUuid', ParseUUIDPipe) sensorUuid: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.eventsService.findBySensorAndDateRange(
        sensorUuid,
        new Date(startDate),
        new Date(endDate),
      );
    }
    return this.eventsService.findBySensor(sensorUuid);
  }

  @Get('sensor/:sensorUuid/stats')
  getStatsBySensor(@Param('sensorUuid', ParseUUIDPipe) sensorUuid: string) {
    return this.eventsService.getStatsBySensor(sensorUuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body(ValidationPipe) updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(uuid, updateEventDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.eventsService.remove(uuid);
  }

  @Post('search')
  search(@Body(ValidationPipe) searchEventDto: SearchEventDto) {
    return this.eventsService.search(searchEventDto);
  }
}