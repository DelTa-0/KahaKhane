🍽️ Restaurant Recommender System
A location-based restaurant recommendation web application that suggests nearby restaurants based on menu items, budget, and user preferences.
Built with Node.js, Express, MongoDB, and EJS.

🚀 Features
✅ Search restaurants by menu item (e.g., “momo”, “burger”)
✅ Filter by price, distance, and rating
✅ Location-based search using Nominatim (OpenStreetMap) geocoding
✅ Distance calculation using Haversine formula / geolib
✅ Caching of geocoded locations for faster repeated lookups
✅ Pagination for large datasets
✅ JWT-based authentication for login and checkout
✅ EJS templating for server-rendered UI
✅ Checkout process with order confirmation flow

🏗️ Tech Stack
Frontend:

EJS (server-side templates)

TailwindCSS (for styling)

Backend:

Node.js & Express.js

MongoDB (Mongoose ODM)

JWT Authentication

Geocoding API (Nominatim)

geolib for distance calculations

Other Tools:

dotenv (for environment variables)

Helmet (security headers)

Nodemon (development)

📦 Installation
bash
Copy
Edit
# Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# Install dependencies
npm install

# Create a .env file
cp .env.example .env
# Add your variables (Mongo URI, JWT secret, etc.)

# Run in development mode
npm run dev