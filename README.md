

# Vefy | JSON file  to Excel file

**Vefy** is a sophisticated fintech automation platform designed to transform complex, multi-layered financial data into structured, actionable insights. By bridging the gap between raw JSON data and human-readable Excel workbooks, Vefy empowers smarter financial decision-making with an AI-first approach.

---

## 🗂️ Project Overview

The **Vefy-JSON-Excel-Engine** is a robust utility that allows users to upload complex JSON files (up to 5MB) and receive a professionally formatted Excel workbook. It features an interactive, branded frontend and a secure NestJS backend designed with modularity and recursive logic at its core.

### 💎 Key Strengths

* **Recursive Depth Handling:** Intelligently maps deeply nested objects into visual hierarchies in Excel.
* **Fail-Fast Security:** Implements rigorous file-pipe validation to protect server resources.
* **Enterprise Branding:** A cohesive user experience from the interactive dashboard to the final exported document.

---

## 🏗️ Repository Structure

This project follows **Clean Architecture** principles to ensure scalability and ease of maintenance:

```plaintext
vefy-json-excel-engine/
├── src/                          
│   ├── json-to-excel/            <-- Feature Module
│   │   ├── json-to-excel.controller.ts
│   │   ├── json-to-excel.service.ts
│   │   └── json-to-excel.module.ts
│   ├── app.module.ts             
│   └── main.ts                   
├── .gitignore                    
├── package.json                  
├── tsconfig.json                 
└── README.md                     

```

---

## ⚙️ Backend Logic & Implementation

To enhance the clarity of your project, it is essential to detail the "how" and "why" behind your code. By explaining the specific logic patterns used, you demonstrate a deep understanding of backend engineering and data processing.

---

## 🛡️ Controller Method: The Request Lifecycle

The controller acts as the entry point and primary security guard for the application.

### 1. Robust File Interception

* **Buffer Processing:** Instead of saving files to a temporary disk location, the controller uses `FileInterceptor` to handle data in memory as a `Buffer`. This approach is faster and more secure for sensitive financial data.
* **Multi-Layered Pipe Validation:** We utilize the `ParseFilePipe` to enforce strict constraints before the request even reaches the service logic:
* **Size Constraint:** Rejects files exceeding **5MB** to prevent server-side memory exhaustion (Denial of Service protection).
* **MIME-Type Strictness:** Ensures only `application/json` is accepted, preventing potential malicious code injection via other file formats.



### 2. Intelligent Filename Transformation

* **Original Name Preservation:** The controller extracts the original filename (e.g., `audit_report.json`) and uses a **Regex** replacement to strip the extension.
* **Dynamic Response Headers:** By appending `.xlsx` to the base name, the system provides a seamless user experience where the downloaded file matches the user's uploaded file name.

---

## 🧠 Service Logic: The Processing Engine

The service contains the heavy-duty logic required to turn unstructured JSON into a clean, human-readable spreadsheet.

### 1. The Recursive Flattening Strategy

* **Hierarchical Navigation:** Financial JSON data is often nested (objects inside objects). The service uses a **Recursive Function** to walk through every level of the data.
* **Visual Logic:** As it descends into nested keys, the service applies **dynamic indentation** and **bold styling** to headers in the Excel sheet. This visually preserves the original "parent-child" relationship of the data for the end user.

### 2. Array Union Mapping

* **Schema Discovery:** When dealing with lists of financial records, some entries might have missing fields. The service performs a "Key Union"—scanning all objects in the array to create a master list of columns.
* **Data Integrity:** This ensures that no data is hidden or lost if a particular JSON object is "sparse" (missing a key that others have).

### 3. ExcelJS Styling Engine

* **Professional Formatting:** Unlike basic CSV exports, our engine uses the `exceljs` library to apply:
* **Auto-Width Columns:** Dynamically calculated based on the longest string in a column.
* **Header Protection:** Freezing the top row so financial analysts can scroll through thousands of rows while keeping headers visible.



---

## 🛠️ Technical Implementations (Strengths)

| Feature | Technical Implementation | Value to Project |
| --- | --- | --- |
| **Security** | `ParseFilePipe` Validators | Prevents crashes from large files and protects against invalid data types. |
| **Scalability** | Modular Architecture | The `JsonToExcelModule` allows this feature to be plugged into any larger NestJS ecosystem easily. |
| **Reliability** | Try-Catch Error Handling | Wraps the conversion process to return clear `BadRequestExceptions` if the JSON is malformed. |
| **User Experience** | Filename Mapping | Maintains the user's naming convention for better file organization. |


## 🖥️ Interactive Frontend

The Vefy frontend is designed for trust and efficiency, featuring a "Fintech Navy" and "Electric Cyan" aesthetic.

### 1. Tool Selection Dashboard

Users are greeted with a suite of automation utilities, emphasizing Vefy's role as a complete financial decision-making hub.

<p align="center">
  <img src="assets/dashboard.png" alt="Vefy Tool Selection Dashboard" width="800">
</p>

### 2. The Converter Interface

The dedicated conversion page features a sleek, interactive dropzone. 

* **User Experience:** Real-time feedback showing "File Ready" and the exact size (e.g., **2.04 MB**) of the selected document.
* **Safety Prompts:** Clear indicators of supported formats and size constraints.

<p align="center">
  <video src="assets/Vefy's_Project_overview.mp4" width="800" controls>
    Your browser does not support the video tag.
  </video>
</p>

## 🛠️ Technical Stack

* **Framework:** NestJS (Node.js)
* **Excel Engine:** ExcelJS
* **Styling:** Modern CSS3 (Flexbox/Grid)
* **Validation:** NestJS `ParseFilePipe`

---

## 🏁 How to Run Locally

1. **Clone:** `git clone https://github.com/your-username/vefy-json-excel-engine.git`
2. **Install:** `npm install`
3. **Start:** `npm run start:dev`
4. **View:** Open your local frontend or navigate to `http://localhost:3001/convert`.




































<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).




