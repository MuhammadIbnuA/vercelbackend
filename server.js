const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const uri =
  "mongodb+srv://uciiiiill:kueleker45@mongodbucil.zjjkeha.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB!");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected!");
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

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

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
// User controller
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create a new user
    const newUser = new User({
      username,
      password, // Store the password as plain text
    });

    // Save the user to the database
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login logic
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ user: user.username }, 'hakunamatata', { expiresIn: '1h' });

    // Set the JWT token as a cookie
    res.cookie('token', token, { maxAge: 3600000, httpOnly: true }); // Expiry set to 1 hour (3600000 milliseconds)

    // Return the token as a response
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
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
    const updatedMenu = await Menu.findByIdAndUpdate(
      menuId,
      updateData,
      { new: true }
    );
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
app.post("/api/menu", createMenu);

// Get a menu by ID
app.get("/api/menu/:id", getMenuById);

// Get all menus
app.get("/api/menu", getAllMenus);

// Update a menu by ID
app.put("/api/menu/:id", updateMenu);

// Delete a menu by ID
app.delete("/api/menu/:id", deleteMenu);

app.post("/api/login", login)

app.post("/api/register", registerUser)

// Start the server
connect().then(() => {
  const port = process.env.PORT || 5999;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
