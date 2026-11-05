const axios = require("axios"); 
const { ELEVENLABS } = require('../../config'); 
 
async function elevenlabs(match) {   
  try { 
    if (!ELEVENLABS) return false; 

    const aittsid = await axios.get("https://gist.githubusercontent.com/Loki-Xer/6e601a0992fa5bc920e4b94f771ec129/raw"); 
    const labsVoiceID = aittsid.data; 
    let response = {}; 

    const parts = match.split(/[|,;]/);
    const text = parts[0]?.trim();
    const voiceKey = parts[1]?.toLowerCase().trim() || "adam";

    if (!text || !voiceKey) return false;

    for (let key in labsVoiceID) { 
      if (voiceKey === key) { 
        let v_key = labsVoiceID[key]["voice_id"]; 
        const voiceURL = `https://api.elevenlabs.io/v1/text-to-speech/${v_key}/stream`; 
         
        response = await axios({ 
          method: "POST", 
          url: voiceURL, 
          data: { 
            text: text, 
            voice_settings: { 
              stability: 0.5, 
              similarity_boost: 0.5, 
            }, 
            model_id: "eleven_multilingual_v2",
          }, 
          headers: { 
            Accept: "audio/mpeg", 
            "xi-api-key": ELEVENLABS, 
            "Content-Type": "application/json", 
          }, 
          responseType: "stream" 
        }); 
        break; 
      } 
    } 
     
    return response.data || false; 
  } catch (error) { 
    return false; 
  } 
} 
 
module.exports = { 
  elevenlabs 
};