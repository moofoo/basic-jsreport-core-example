const { readFileSync, writeFileSync, unlinkSync } = require("fs");
const templateData = require('./data.json');

// remove existing report files, if they exist
try {
  unlinkSync("./report.docx");
  unlinkSync("./report.pdf");
} catch (err) {
  console.log("no report files");
}

// Create jsreport instance
const jsreport = require("@jsreport/jsreport-core")();

// Add plugins: docx recipe, handlebars engine and unoconv extension for pdf conversion
jsreport.use(require("@jsreport/jsreport-docx")());
jsreport.use(require("@jsreport/jsreport-handlebars")());
jsreport.use(require("@jsreport/jsreport-unoconv")());

(async () => {
  // Initialize jsreport instance
  await jsreport.init();

  // Read template.docx, base64 encoded
  const content = readFileSync("./template.docx", {encoding: "base64"});

  // Render a .docx report from template
  const resultDocx = await jsreport.render({
    template: {
      content: "",
      recipe: "docx",
      engine: "handlebars",
      docx: {
        templateAsset: {
          content,
          encoding: "base64",
        },
      },
    },
    data:templateData
  });

  // Write report.docx to disk
  await writeFileSync("./report.docx", resultDocx.content, {encoding: "utf-8"});
  console.log("report.docx created");

  // Render a .pdf report from template using unoconv extension
  const resultPdf = await jsreport.render({
    template: {
      content: "",
      recipe: "docx",
      engine: "handlebars",
      docx: {
        templateAsset: {
          content,
          encoding: "base64",
        },
      },
      unoconv: {
        format: "pdf",
        enabled: true,
      },
    },
    data: templateData
  });

  // Write report.pdf to disk
  await writeFileSync("./report.pdf", resultPdf.content, "binary");
  console.log("report.pdf created");
})();
