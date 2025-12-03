//android
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  // CREATE MESSAGE
  async create(dto: CreateMessageDto): Promise<Message> {
    const msg = new this.messageModel(dto);
    return msg.save();
  }

  // GET ALL
  async findAll(): Promise<Message[]> {
    return this.messageModel.find().sort({ createdAt: -1 });
  }

  // GET ONE
  async findOne(id: string): Promise<Message> {
    const msg = await this.messageModel.findById(id);
    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }

  // UPDATE
  async update(id: string, dto: CreateMessageDto): Promise<Message> {
    const updated = await this.messageModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Message not found');
    return updated;
  }

  // DELETE
  async remove(id: string): Promise<void> {
    await this.messageModel.findByIdAndDelete(id);
  }

  // 🔥 GET LISTE DES CONVERSATIONS POUR UN USER
// GET LISTE DES CONVERSATIONS POUR UN USER
// GET LISTE DES CONVERSATIONS POUR UN USER
async getUserConversations(userId: string) {
  console.log("🔥 [SERVICE] getUserConversations() called with:", userId);

  try {
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userId },
          { receiverId: userId },
        ],
      })
      .sort({ createdAt: -1 })
      .populate({
        path: 'senderId',
        select: 'nom prenom role'
      })
      .populate({
        path: 'receiverId',
        select: 'nom prenom role'
      })
      .lean();

    console.log("📥 MESSAGES LOADED:", messages.length);

    const grouped: Record<string, any> = {};

    for (const msg of messages) {
      console.log("➡️ MSG:", msg);

      const sender: any = msg.senderId && typeof msg.senderId === 'object'
        ? msg.senderId
        : null;

      const receiver: any = msg.receiverId && typeof msg.receiverId === 'object'
        ? msg.receiverId
        : null;

      const other = sender && sender._id?.toString() === userId
        ? receiver
        : sender;

      // LOG pour diagnostiquer
      console.log("🧩 SENDER:", sender);
      console.log("🧩 RECEIVER:", receiver);
      console.log("🧩 OTHER:", other);

      if (!other || !other._id) {
        console.log("⚠️ IGNORÉ : Populate a échoué ici !");
        continue;
      }

      const otherId = other._id.toString();

      if (!grouped[otherId]) {
        grouped[otherId] = {
          userId: otherId,
          fullName: `${other.nom ?? ''} ${other.prenom ?? ''}`.trim(),
          role: other.role ?? null,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        };
      }
    }

    return Object.values(grouped)
      .sort((a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
      );

  } catch (e) {
    console.error("❌ ERREUR EXACTE DÉTECTÉE:", e);
    throw e; // pas throw new Error → throw l'erreur brute pour afficher dans Swagger
  }
}


  // GET CONVERSATION ENTRE DEUX USERS
  async getConversation(user1: string, user2: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      })
      .sort({ createdAt: 1 });
  }
}
// message.service.ts
// message.service.ts
//ioooos
// message.service.ts
/*import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { Utilisateur } from '../utilisateurs/schemas/utilisateur.schema';  // ✅ ICI

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,

    @InjectModel(Utilisateur.name)           // ✅ Injection correcte
    private readonly utilisateurModel: Model<Utilisateur>,
  ) {}

  // ENVOI MESSAGE
  async sendMessage(
    receiverId: string,
    body: { content: string; senderId: string },
  ) {
    return await this.messageModel.create({
      senderId: new Types.ObjectId(body.senderId),
      receiverId: new Types.ObjectId(receiverId),
      content: body.content,
      type: 'text',
    });
  }

  // LIRE CONVERSATION ENTRE 2 USERS
  async getConversationBetween(user1: string, user2: string) {
    const u1 = new Types.ObjectId(user1);
    const u2 = new Types.ObjectId(user2);

    return this.messageModel
      .find({
        $or: [
          { senderId: u1, receiverId: u2 },
          { senderId: u2, receiverId: u1 },
        ],
      })
      .sort({ createdAt: 1 });
  }
async searchInConversation(user1: string, user2: string, query: string) {
  const u1 = new Types.ObjectId(user1);
  const u2 = new Types.ObjectId(user2);

  return this.messageModel.find({
    $or: [
      { senderId: u1, receiverId: u2 },
      { senderId: u2, receiverId: u1 },
    ],
    content: { $regex: query, $options: 'i' }   // 🔎 recherche insensible à la casse
  });
}
async markAsRead(messageId: string, readerId: string) {
  const msg = await this.messageModel.findById(messageId) as Message;
  if (!msg) return null;

  if (msg.isRead) return msg;

  msg.isRead = true;
  msg.readAt = new Date();
  await msg.save();

  return msg;
}


  // LISTE DES CONVERSATIONS POUR UN USER
  async getUserConversations(userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const userIdStr = userObjId.toString();

    // 1) Récupérer tous les messages du user
    const msgs = await this.messageModel
      .find({
        $or: [
          { senderId: userObjId },
          { receiverId: userObjId },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // 2) Trouver tous les autres utilisateurs
    const otherIdsSet = new Set<string>();

    for (const msg of msgs) {
      const sender = msg.senderId.toString();
      const receiver = msg.receiverId.toString();

      const otherId = sender === userIdStr ? receiver : sender;
      otherIdsSet.add(otherId);
    }

    const otherIdsArray = Array.from(otherIdsSet).map(
      id => new Types.ObjectId(id),
    );

    // 3) Charger les infos des utilisateurs
    const utilisateurs = await this.utilisateurModel
      .find({ _id: { $in: otherIdsArray } })
      .lean();

    const utilisateurMap = new Map<string, any>();
    for (const u of utilisateurs) {
      utilisateurMap.set(u._id.toString(), u);
    }

    // 4) Construire les conversations enrichies
    const conversations = new Map<string, any>();

    for (const msg of msgs) {
      const sender = msg.senderId.toString();
      const receiver = msg.receiverId.toString();

      const otherId = sender === userIdStr ? receiver : sender;

      if (!conversations.has(otherId)) {
        const other = utilisateurMap.get(otherId);

        // ⛔ ADAPTE ICI SELON TON SCHEMA
        const prenom = other?.firstName || other?.prenom || '';
        const nom = other?.lastName || other?.nom || '';

        const fullName = (prenom + ' ' + nom).trim() || 'Utilisateur';

        conversations.set(otherId, {
          userId: otherId,
          userName: fullName,         // ✅ envoyé à iOS
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
    }

    return Array.from(conversations.values());
  }
}
*/