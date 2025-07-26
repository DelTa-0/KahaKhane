const reviewModel = require("../models/review.model");
const UserModel = require("../models/user.model");

module.exports.getProfile =  async function (req, res){
  const userId = req.user.id;
  const user = await UserModel.findById(userId)
    .populate({
      path: 'orders.items.restaurant',   
      model: 'Restaurant',               
      select: 'name'                     
    })
    .lean();

  const orders = (user.orders || []).filter(order =>
    order.items.some(item => item.status === 'completed')
  );

  // sort newest first
  orders.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

  // get reviewed restaurants
  const reviews = await reviewModel.find({ userId: userId }).lean();
  const reviewedKeys = reviews.map(r => `${r.orderId}_${r.foodName}`);
  res.render('profile', { user, orders, reviewedKeys });
}

