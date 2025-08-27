import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { voucher } = req.body;
  const repoOwner = "YOUR_GITHUB_USERNAME"; // <- change
  const repoName = "voucher-data-store";
  const filePath = "vouchers.json";
  const token = process.env.GITHUB_TOKEN;

  // Step 1: Get current file
  const fileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    headers: { Authorization: `token ${token}` }
  });

  const fileData = await fileRes.json();

  let vouchers = [];
  if (fileData.content) {
    vouchers = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf8"));
  }

  // Step 2: Add new voucher
  vouchers.push(voucher);

  // Step 3: Update file on GitHub
  const updateRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Add voucher",
      content: Buffer.from(JSON.stringify(vouchers, null, 2)).toString("base64"),
      sha: fileData.sha
    })
  });

  const updateData = await updateRes.json();
  res.status(200).json({ message: "Voucher saved ✅", updateData });
}
