/**
 * Wrapper para evitar repetição de try-catch em controllers
 * 
 * Uso:
 * router.get('/users/:id', catchAsync(async (req, res) => {
 *   const user = await User.findByPk(req.params.id);
 *   if (!user) throw new AppError('Usuário não encontrado', 404);
 *   res.json(user);
 * }));
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
