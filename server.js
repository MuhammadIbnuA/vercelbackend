const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors")

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://uciiiiill:kueleker45@mongodbucil.zjjkeha.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
const connect = async () => {
  try {
      mongoose.connect(uri);
      console.log('Connected to mongoDB!')
  } catch (error) {
      throw error
  } 
}



mongoose.connection.on('disconnected', ()=>{
  console.log('MongoDB disconnected!')
});

// Menu model
const menuSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  harga: {
    type: String,
    required: true,
  },
  kategori: {
    type: String,
    required: true,
  },
});
const Menu = mongoose.model("Menu", menuSchema);

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract token from the Authorization header
    const decoded = jwt.verify(token, "hakunamatata"); // Verify the token using the secret key

    // Attach the decoded token to the request object
    req.user = decoded.user;

    next(); // Move to the next middleware
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Menu controller
// Create a new menu
async function createMenu(req, res) {
  try {
    const { nama, harga, kategori } = req.body;
    const menu = new Menu({ nama, harga, kategori });
    await menu.save();
    res.send("Menu created successfully");
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).send("Error creating menu");
  }
}

// Get a menu by ID
async function getMenuById(req, res) {
  try {
    const menuId = req.params.id;
    const menu = await Menu.findById(menuId);
    if (!menu) {
      res.status(404).send("Menu not found");
    } else {
      res.json(menu);
    }
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).send("Error fetching menu");
  }
}

// Get all menus
async function getAllMenus(req, res) {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).send("Error fetching menus");
  }
}

// Update a menu by ID
async function updateMenu(req, res) {
  try {
    const menuId = req.params.id;
    const updateData = req.body;
    const updatedMenu = await Menu.findByIdAndUpdate(menuId, updateData, { new: true });
    if (!updatedMenu) {
      res.status(404).send("Menu not found");
    } else {
      res.json(updatedMenu);
    }
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).send("Error updating menu");
  }
}

// Delete a menu by ID
async function deleteMenu(req, res) {
  try {
    const menuId = req.params.id;
    const deletedMenu = await Menu.findByIdAndDelete(menuId);
    if (!deletedMenu) {
      res.status(404).send("Menu not found");
    } else {
      res.send("Menu deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(500).send("Error deleting menu");
  }
}

// Routes
// Create a new menu
app.post("/menu", createMenu);

// Get a menu by ID
app.get("/menu/:id", getMenuById);

// Get all menus
app.get("/menu", isAuthenticated, getAllMenus);

// Update a menu by ID
app.put("/menu/:id", updateMenu);

// Delete a menu by ID
app.delete("/menu/:id", deleteMenu);

// Start the server
app.listen(5999, () => {
  connect()
  console.log(`Server is running on port 5999`);
});
