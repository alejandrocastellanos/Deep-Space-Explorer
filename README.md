# Deep Space Explorer 🚀

An immersive, high-fidelity web application for cosmic exploration. **Deep Space Explorer** integrates real-time data from NASA and CelesTrak to provide a stunning 3D experience of our near-earth environment.

![Home](file:///Users/alejo/Documents/Personal/nasa%20proyect/Deep-Space-Explorer/imagenesReadme/home.png)

## 🌌 Key Features

- **3D Asteroid Radar**: Real-time visualization of Near-Earth Objects (NEOs). Features a logarithmic distance scale and the Moon as a visual reference (1 LD).
- **Satellite Tracking System**: Real-time 3D propagation of thousands of satellites (ISS, Starlink, GPS, Weather) using `satellite.js` and CelesTrak TLE data.
- **Artemis II Mission Hub**: Comprehensive mission manifest, detailed timeline, and high-quality portraits of the Artemis II crew.
- **NASA Media Integration**: Daily "Astronomy Picture of the Day" (APOD) with detailed context and a searchable media gallery.
- **Dynamic Lighting**: 3D globe lighting synchronized with the user's current UTC time (Sidereal Time) for a realistic day/night cycle.
- **Multilingual UI**: Fully localized in English and Spanish with a corrected language selection status.

## 📸 Screenshots

### Asteroid Radar 3D
![Asteroids](file:///Users/alejo/Documents/Personal/nasa%20proyect/Deep-Space-Explorer/imagenesReadme/asteroids.png)

### NASA Picture of the Day
![POTD](file:///Users/alejo/Documents/Personal/nasa%20proyect/Deep-Space-Explorer/imagenesReadme/imagen%20del%20dia.png)

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **3D Engine**: Three.js + React Three Fiber
- **State & Data**: React Query (TanStack Query) + Axios
- **Physics**: satellite.js (TLE Propagation)
- **Styling**: Vanilla CSS + HUD/Glassmorphism design system
- **Icons**: Google Material Symbols

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alejandrocastellanos/Deep-Space-Explorer.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_NASA_API_KEY=YOUR_NASA_API_KEY
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
