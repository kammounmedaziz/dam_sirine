import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MulterModule } from '@nestjs/platform-express';

// 👇 Import obligatoire pour accéder au modèle utilisateur
import { Utilisateur, UtilisateurSchema } from 'src/utilisateurs/schemas/utilisateur.schema';
import { UtilisateursModule } from 'src/utilisateurs/utilisateurs.module';

// 👇 Import AI services
import { AiConfigService } from './services/ai-config.service';
import { OpenRouterClientService } from './services/openrouter-client.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/messages',
    }),

    // 👇 Registre des modèles Mongoose nécessaires
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Utilisateur.name, schema: UtilisateurSchema },  // ✅ OBLIGATOIRE
    ]),

    // 👇 Pour pouvoir injecter UtilisateurModel dans MessageService
    UtilisateursModule,
  ],

  controllers: [MessageController],
  providers: [
    MessageService,
    AiConfigService,
    OpenRouterClientService,
  ],

  // 👇 Si un autre module veut accéder au service messages
  exports: [MessageService],
})
export class MessageModule {}
