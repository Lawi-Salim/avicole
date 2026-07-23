import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import bcrypt from 'bcryptjs';
import { User } from './user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const hash = await bcrypt.hash(dto.mot_de_passe, 10);
    const user = await this.userModel.create({
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      telephone: dto.telephone,
      adresse: dto.adresse,
      password_hash: hash,
      role: dto.role || 'admin',
    });

    const token = this.signToken(user);
    return {
      token,
      utilisateur: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const valid = await bcrypt.compare(dto.mot_de_passe, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.actif) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const token = this.signToken(user);
    return {
      token,
      utilisateur: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async findAll() {
    return this.userModel.findAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'role', 'actif', 'created_at', 'updated_at'],
      order: [['nom', 'ASC']],
    });
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id, {
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'role', 'actif', 'created_at', 'updated_at'],
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    }
    return user;
  }

  async update(id: string, dto: Partial<{ nom: string; prenom?: string; email: string; telephone?: string; adresse?: string; role: string; actif: boolean }>) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    }
    const updateData: Record<string, unknown> = {};
    if (dto.nom !== undefined) updateData.nom = dto.nom;
    if (dto.prenom !== undefined) updateData.prenom = dto.prenom;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.telephone !== undefined) updateData.telephone = dto.telephone;
    if (dto.adresse !== undefined) updateData.adresse = dto.adresse;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.actif !== undefined) updateData.actif = dto.actif;
    await user.update(updateData);
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
      role: user.role,
      actif: user.actif,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hash });

    return { message: 'Mot de passe modifié avec succès' };
  }

  async toggleActif(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    }
    await user.update({ actif: !user.actif });
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
      role: user.role,
      actif: user.actif,
    };
  }

  async remove(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    }
    await user.destroy();
    return { message: 'Utilisateur supprimé' };
  }

  private signToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
