### Kettle Control Station
It's a Vue 3 and TypeScript-based web application designed specifically for my friend's kettle...

![img-0651_eRbjIu9l (1) (online-video-cutter com)](https://github.com/aniamarkh/kettle-station/assets/93217444/0680a5ae-048f-490f-83cc-c0c5e60ae62b)

It allows him to remotely control the kettle through a web interface after authorization: to adjust the kettle's temperature, initiate the boiling process, and maintain a specified warmth level.

The application connects to the Bosch kettle's retrofitted ESP32-S3 microcontroller via WebSocket communication. The microcontroller, programmed with Micropython, serves as the server for the web application.

You can try [DEMO](https://kettle-station.vercel.app/) (**"porol" is a correct password**) without directly connecting to the physical kettle :)

[Node.js server](https://github.com/aniamarkh/kettle-station-be) has been implemented to provide a simulated version of the kettle's functionality:
- Sets up a WebSocket server.
- On each client request, it sends a status message and challenge message for authorization.
- Responds to client messages (such as button presses and pings).
- Sends updated kettle status to all connected clients after successful operations.

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository:

`git clone https://github.com/aniamarkh/kettle-station.git`

2. Install the dependencies:

`npm install`

3. Launch the development server:

`npm run start`

4. Compile and minify for Production:

`npm run build && npm run preview`
