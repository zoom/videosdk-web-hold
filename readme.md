# Video SDK Web - Waiting Room
Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

The [Zoom Video SDK for web](https://developers.zoom.us/docs/video-sdk/web/) enables you to build custom video experiences on a webpage with Zoom's core technology. 

This Sample offers a demo of the Hold Feature using Zoom Video SDK, enabling out-the-box waiting room functionality compatible between Video SDK platforms

## Prequisites
- NPM and Node.js
- Active Video SDK Account

## Installation
To get started, clone the repo:

`git clone https://github.com/zoom/videosdk-web-hold.git`

Navigate to the root directory:

`cd videosdk-web-hold`

and install the dependencies:

`npm install`

## JWT Helper

The project provides a `generateToken.ts` file that can be used to generate a temporary JWT:
1. Create a `.env` file in the root directory of the project, you can do this by copying the `.env.example` file (`cp .env.example .env`) and replacing the values with your own. The `.env` file should look like this:

```
ZOOM_SDK_KEY=
ZOOM_SDK_SECRET=
```

2. Run `npm run token [sessionname] [role (0 or 1)] [hold (0, 1, or 2)] --copy-to-clipboard`

The script generates a token for the proivded session name and the `--copy-to-clipboard` or `-c` flag copies it to your clipboard.

3. Run the app:

   `npm run dev`

## Usage

1. Navigate to http://localhost:5173

2. Click "Join" to join the session and enter your JWT Token
   
3. Depending on the role entered in your JWT you will either enter a waiting room as a participart or join the session with waiting room control features enabled

For the full list of features and event listeners, as well as additional guides, see our [Video SDK docs](https://developers.zoom.us/docs/video-sdk/web/).

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://explore.zoom.us/docs/en-us/developer-support-plans.html) plans.

## Disclaimer

Do not expose your credentials to the client, when using the Video SDK in production please make sure to use a backend service to sign the tokens. Don't store credentials in plain text, as this is a sample app we're using an `.env` for sake of simplicity.
