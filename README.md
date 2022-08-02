# noteblitz.app

NoteBlitz is a simple microblogging platform with a taxonomy system to enable discoverability leveraging Bitcoin and the ln-url standards. This website was made as a personal proof of concept for the interaction between the web and the lightning network, to test out some cool libraries like tailwind, tRPC and Nextjs in production, to find the best way to orchestrate a lightning network node and to gain experience with UI/UX design from the ground up.

#### Install

* `yarn`

#### generate prisma client

* `npx prsima generate`

#### seed db

* `npx prsima db seed`

#### dev cluster

* `cd dev-cluster`
* `yarn`
* `yarn dev`

this should spin up 2 lnds and 2 bitcoin nodes and their credentials should be written to the `copy-to.env` file. 

* copy `env.sample` and replace the lnd related entries with the contents of `copy-to.env`.

### developing on local network

if you want to try out the cool lightning network functionality with your cellphones wallet, the machine running your app and the cellphone have to be connected with the same network.

* fin out the ip of you machine and replace the `DOMAIN` entry with it
* `yarn dev -H <your-ip>` in the root folder

* navigate to `<your-ip>` in the browser