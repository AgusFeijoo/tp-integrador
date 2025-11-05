const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/UsuarioRepository');

class AuthService {
  async register(nombre, email, password, rol) {
    const usuarioExistente = await usuarioRepository.findByEmail(email);

    if (usuarioExistente) {
      const error = new Error('Ya existe un usuario con este email');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await usuarioRepository.create({
      nombre,
      email,
      passwordHash,
      rol,
    });

    const token = this.generarToken(usuario.id, usuario.rol);

    return {
      usuario,
      token,
    };
  }

  async login(email, password) {
    const usuario = await usuarioRepository.findByEmail(email);

    if (!usuario) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValido) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generarToken(usuario.id, usuario.rol);

    const usuarioSinPassword = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      usuario: usuarioSinPassword,
      token,
    };
  }

  generarToken(userId, rol) {
    return jwt.sign(
      { userId, rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }
}

module.exports = new AuthService();

