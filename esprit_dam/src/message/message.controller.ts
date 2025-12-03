//android
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: "Créer un message" })
  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.messageService.create(dto);
  }

  @ApiOperation({ summary: "Liste des conversations d'un user" })
  @ApiQuery({ name: 'userId', type: String })
  @Get('conversations')
getUserConversations(@Query('userId') userId: string) {
  console.log("🚀 ROUTE /messages/conversations appelée avec userId =", userId);
  return this.messageService.getUserConversations(userId);
}


  @ApiOperation({ summary: "Conversation entre deux utilisateurs" })
  @Get('conversation/:u1/:u2')
  getConversation(@Param('u1') u1: string, @Param('u2') u2: string) {
    return this.messageService.getConversation(u1, u2);
  }

  @ApiOperation({ summary: "Liste de tous les messages" })
  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @ApiOperation({ summary: "Trouver un message par ID" })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @ApiOperation({ summary: "Modifier un message" })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateMessageDto) {
    return this.messageService.update(id, dto);
  }

  @ApiOperation({ summary: "Supprimer un message" })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
@Post('upload-audio')
@UseInterceptors(FileInterceptor('file'))
uploadAudio(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException("Aucun fichier reçu");
  }

  return {
    url: `/uploads/messages/${file.filename}`,
    type: "audio"
  };
}
}

// message.controller.ts
// message.controller.ts
///ioos

/*import { MessageService } from './message.service';
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';

@Controller('messages')
export class MessageController {
  constructor(private readonly service: MessageService) {}

  // 👉 Envoyer un message
  @Post(':receiverId')
  sendMessage(
    @Param('receiverId') receiverId: string,
    @Body() body: { content: string; senderId: string },
  ) {
    return this.service.sendMessage(receiverId, body);
  }

  // 👉 Récupérer la conversation entre 2 utilisateurs
  @Get('conversation/:u1/:u2')
  getConversation(
    @Param('u1') u1: string,
    @Param('u2') u2: string,
  ) {
    return this.service.getConversationBetween(u1, u2);
  }
  // 🔍 Recherche dans conversation
@Get('search/:u1/:u2')
searchConversation(
  @Param('u1') u1: string,
  @Param('u2') u2: string,
  @Query('q') q: string,
) {
  return this.service.searchInConversation(u1, u2, q);
}

// ✔ Marquer un message comme lu
@Post('read/:messageId')
markAsRead(
  @Param('messageId') messageId: string,
  @Body() body: { readerId: string },
) {
  return this.service.markAsRead(messageId, body.readerId);
}


  // 👉 Récupérer toutes les conversations d'un utilisateur
  @Get('conversations/:userId')
  getUserConversations(@Param('userId') userId: string) {
    return this.service.getUserConversations(userId);
  }
}*/
