const FormData = require('form-data');
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const removeBg = async (inputPath, REMOVE_BG) => {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append(
    "image_file",
    fs.createReadStream(inputPath),
    path.basename(inputPath)
  );
  try {
    const response = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      responseType: "arraybuffer",
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": REMOVE_BG,
      },
      encoding: null,
    });

    if (response.status !== 200) {
      console.error("Error:", response.status, response.statusText);
      return false;
    }

    return response.data;
  } catch (error) {
    console.error("Request failed:", error);
    return false;
  }
};

module.exports = {
  removeBg
};
