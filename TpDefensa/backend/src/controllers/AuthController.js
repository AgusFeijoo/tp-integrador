const authService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      if (!['DUENIO', 'INSPECTOR', 'ADMIN'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      const resultado = await authService.register(nombre, email, password, rol);

      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const resultado = await authService.login(email, password);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

