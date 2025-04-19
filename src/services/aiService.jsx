// Enhanced AI service for SVG editing with parametric approach

// Function to parse SVG path data into structured segments
const parseSvgPath = (pathData) => {
  if (!pathData) return [];
  
  // Match all SVG path commands and their parameters
  const pathCommands = pathData.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || [];
  
  let segments = [];
  let currentX = 0;
  let currentY = 0;
  
  pathCommands.forEach((command, index) => {
    const type = command[0];
    const params = command.substring(1).trim().split(/[\s,]+/).map(Number);
    
    let segment = { id: `seg-${index}`, type, params, original: command.trim() };
    
    // Add human-readable coordinates based on command type
    switch (type) {
      case 'M': // Move to
        segment.description = 'Move to';
        segment.x1 = params[0];
        segment.y1 = params[1];
        currentX = params[0];
        currentY = params[1];
        break;
      case 'L': // Line to
        segment.description = 'Line to';
        segment.x1 = currentX;
        segment.y1 = currentY;
        segment.x2 = params[0];
        segment.y2 = params[1];
        currentX = params[0];
        currentY = params[1];
        break;
      case 'Z': // Close path
        segment.description = 'Close path';
        break;
      case 'Q': // Quadratic curve
        segment.description = 'Curve';
        segment.x1 = currentX;
        segment.y1 = currentY;
        segment.cpx = params[0]; // Control point x
        segment.cpy = params[1]; // Control point y
        segment.x2 = params[2];
        segment.y2 = params[3];
        currentX = params[2];
        currentY = params[3];
        break;
      // Add more cases for other path commands as needed
    }
    
    segments.push(segment);
  });
  
  return segments;
};

// Function to regenerate SVG path from segments
const generatePathFromSegments = (segments) => {
  return segments.map(segment => {
    switch (segment.type) {
      case 'M':
        return `M ${segment.x1} ${segment.y1}`;
      case 'L':
        return `L ${segment.x2} ${segment.y2}`;
      case 'Z':
        return 'Z';
      case 'Q':
        return `Q ${segment.cpx} ${segment.cpy} ${segment.x2} ${segment.y2}`;
      default:
        return segment.original;
    }
  }).join(' ');
};

// Function to create a parametric representation of the SVG
const createParametricRepresentation = (svgData) => {
  const segments = parseSvgPath(svgData);
  
  // Create a human-readable description of the SVG
  const description = segments.map((seg, index) => {
    switch (seg.type) {
      case 'M':
        return `Starting point: (${seg.x1}, ${seg.y1})`;
      case 'L':
        return `Line from (${seg.x1}, ${seg.y1}) to (${seg.x2}, ${seg.y2})`;
      case 'Z':
        return 'Closed path';
      case 'Q':
        return `Curve from (${seg.x1}, ${seg.y1}) to (${seg.x2}, ${seg.y2}) with control point at (${seg.cpx}, ${seg.cpy})`;
      default:
        return `Segment ${index+1}: ${seg.original}`;
    }
  }).join('\n');
  
  // Create a JSON representation of the parameters
  const parameters = {};
  segments.forEach((seg, index) => {
    const segmentId = `segment_${index + 1}`;
    parameters[segmentId] = {
      type: seg.type,
      description: seg.description
    };
    
    // Add parameters based on type
    if (seg.x1 !== undefined) parameters[segmentId].startX = seg.x1;
    if (seg.y1 !== undefined) parameters[segmentId].startY = seg.y1;
    if (seg.x2 !== undefined) parameters[segmentId].endX = seg.x2;
    if (seg.y2 !== undefined) parameters[segmentId].endY = seg.y2;
    if (seg.cpx !== undefined) parameters[segmentId].controlX = seg.cpx;
    if (seg.cpy !== undefined) parameters[segmentId].controlY = seg.cpy;
  });
  
  return {
    description,
    parameters,
    segments
  };
};

// Function to modify a specific parameter in the SVG
const modifyParameter = (svgData, segmentIndex, paramName, newValue) => {
  const segments = parseSvgPath(svgData);
  
  if (segmentIndex < 0 || segmentIndex >= segments.length) {
    return { success: false, message: "Invalid segment index" };
  }
  
  const segment = segments[segmentIndex];
  
  // Map parameter name to segment property
  const paramMap = {
    'startX': 'x1',
    'startY': 'y1',
    'endX': 'x2',
    'endY': 'y2',
    'controlX': 'cpx',
    'controlY': 'cpy'
  };
  
  const segmentProperty = paramMap[paramName];
  if (!segmentProperty || segment[segmentProperty] === undefined) {
    return { success: false, message: "Invalid parameter for this segment type" };
  }
  
  // Update the parameter
  segments[segmentIndex] = {
    ...segment,
    [segmentProperty]: newValue
  };
  
  // Regenerate the path
  const modifiedPathData = generatePathFromSegments(segments);
  
  return {
    success: true,
    modifiedData: modifiedPathData,
    message: `Modified ${paramName} of segment ${segmentIndex + 1} to ${newValue}`
  };
};

export const processSvgEditRequest = async (svgData, userRequest) => {
  try {
    // Check if this is a creation request rather than a modification
    const isCreationRequest = userRequest.toLowerCase().includes('create') || 
                              userRequest.toLowerCase().includes('make a new') || 
                              userRequest.toLowerCase().includes('draw a new') ||
                              !svgData;
    
    let systemPrompt = '';
    
    if (isCreationRequest) {
      // Prompt for creating a new icon
      systemPrompt = `
      You're an AI assistant specializing in SVG creation. You can create minimal, clean SVG icons based on descriptions.

Rules:
1. Always respond with a valid JSON object containing these fields:
   - "path": The SVG path data for the new icon (or null if clarification is needed)
   - "message": Your response text explaining what you created
   - "modifications": An empty array (since this is a creation, not a modification)

2. When creating icons:
   - Keep the design minimal and clean
   - Use a coordinate space of roughly 0-100 with center at (50,50)
   - Focus on recognizable shapes and clear outlines
   - Create SVG paths that are simple yet expressive
   - Use M (moveto), L (lineto), C (cubic bezier), Q (quadratic bezier), and Z (closepath) commands

Example response for creating a moon icon:
{
  "path": "M 30 50 C 30 27.91 47.91 10 70 10 C 56.15 10 42.95 16.29 33.93 27.93 C 24.9 39.56 21.11 54.69 23.61 69.39 C 26.11 84.09 34.61 97.05 47.2 105.36 C 59.8 113.68 75.27 116.38 90 112.69 C 67.91 112.69 50 94.78 50 72.69 C 50 61.74 54.22 51.24 61.97 43.48 C 69.73 35.73 80.23 31.5 91.18 31.5 C 80.23 31.5 69.73 35.73 61.97 43.48 C 54.22 51.24 50 61.74 50 72.69 C 50 94.78 67.91 112.69 90 112.69 C 67.91 112.69 50 94.78 50 72.69 C 50 50.6 67.91 32.69 90 32.69 C 70.67 32.69 55 48.36 55 67.69 C 55 87.02 70.67 102.69 90 102.69 C 75.27 106.38 59.8 103.68 47.2 95.36 C 34.61 87.05 26.11 74.09 23.61 59.39 C 21.11 44.69 24.9 29.56 33.93 17.93 C 42.95 6.29 56.15 0 70 0 C 47.91 0 30 17.91 30 40 L 30 50 Z",
  "message": "I've created a minimal crescent moon icon."
}

Example response for creating a simple house icon:
{
  "path": "M50 10 L90 50 L90 90 L10 90 L10 50 Z M40 90 L40 60 L60 60 L60 90 Z",
  "message": "I've created a simple house icon with a triangular roof and rectangular door."
}

Example response for clarification:
{
  "path": null,
  "message": "Could you provide more details about what kind of icon you'd like me to create?",
  "modifications": []
}
      `;
    } else {
      // Parse the current SVG into a structured representation
      const { description, parameters, segments } = createParametricRepresentation(svgData);
      
      // Prompt for modifying an existing icon
      systemPrompt = `
      You're an AI assistant specializing in SVG editing. You can modify existing SVG icons based on descriptions.

Rules:
1. Always respond with a valid JSON object containing these fields:
   - "path": The modified SVG path data (or null if clarification is needed)
   - "message": Your response text explaining what you did
   - "modifications": An array of the specific changes made (each with segmentIndex, parameter, oldValue, newValue)

2. Here is the CURRENT SVG PATH STRUCTURE in human-readable format:
${description}

3. Here are the PARAMETERS that can be modified:
${JSON.stringify(parameters, null, 2)}

4. When making modifications:
   - Identify which segment(s) need to be changed
   - Determine which parameter(s) to modify
   - Specify the exact numerical changes
   - Keep modifications minimal and focused on the user's request
   - Preserve the general shape identity while applying requested changes

Example response for modification:
{
  "path": "M50 5 L95 95 L5 95 Z M50 40 L70 60 L70 90 L55 90 L55 70 L45 70 L45 90 L30 90 L30 60 Z",
  "message": "I've made the roof taller as requested.",
  "modifications": [
    {"segmentIndex": 0, "parameter": "startY", "oldValue": 10, "newValue": 5},
    {"segmentIndex": 1, "parameter": "endX", "oldValue": 90, "newValue": 95},
    {"segmentIndex": 2, "parameter": "endX", "oldValue": 10, "newValue": 5}
  ]
}

Example response for clarification:
{
  "path": null,
  "message": "Could you please specify which part of the icon you'd like me to modify?",
  "modifications": []
}

The current SVG path data is: ${svgData}
      `;
    }

    // Add more examples for creation
    if (isCreationRequest) {
      systemPrompt += `
Additional icon examples:
- Document: "M20 10 L80 10 L80 90 L20 90 Z M30 25 L70 25 M30 40 L70 40 M30 55 L70 55 M30 70 L50 70"
- Cloud: "M25 60 C25 46.19 36.19 35 50 35 C58.28 35 65.64 39.08 69.86 45.5 C72.04 44.52 74.46 44 77 44 C86.94 44 95 52.06 95 62 C95 71.94 86.94 80 77 80 L30 80 C21.72 80 15 73.28 15 65 C15 56.72 21.72 50 30 50 C30 49.33 30.03 48.68 30.09 48.03 C27.06 51.46 25 55.98 25 61 L25 60 Z"
- Star: "M50 10 L61.76 36.21 L90 40.27 L69.6 60.29 L74.27 90 L50 75.21 L25.73 90 L30.4 60.29 L10 40.27 L38.24 36.21 Z"
- Location Pin: "M50 10 C65.46 10 78 22.54 78 38 C78 59.5 50 90 50 90 C50 90 22 59.5 22 38 C22 22.54 34.54 10 50 10 Z M50 25 C57.73 25 64 31.27 64 39 C64 46.73 57.73 53 50 53 C42.27 53 36 46.73 36 39 C36 31.27 42.27 25 50 25 Z"
- Heart: "M50 30 C50 30 65 10 85 20 C105 30 95 60 50 90 C5 60 -5 30 15 20 C35 10 50 30 50 30 Z"
- Clock: "M50 10 C27.91 10 10 27.91 10 50 C10 72.09 27.91 90 50 90 C72.09 90 90 72.09 90 50 C90 27.91 72.09 10 50 10 Z M50 20 C66.57 20 80 33.43 80 50 C80 66.57 66.57 80 50 80 C33.43 80 20 66.57 20 50 C20 33.43 33.43 20 50 20 Z M50 25 L50 50 L65 65"
- Person: "M50 20 C57.73 20 64 26.27 64 34 C64 41.73 57.73 48 50 48 C42.27 48 36 41.73 36 34 C36 26.27 42.27 20 50 20 Z M30 90 L30 75 C30 64.77 38.95 56.44 50 56.03 C61.05 56.44 70 64.77 70 75 L70 90 L30 90 Z"
- Bell: "M50 15 C51.66 15 53 16.34 53 18 L53 20.34 C65.71 22.13 75 33.08 75 46 L75 66 L85 76 L85 81 L15 81 L15 76 L25 66 L25 46 C25 33.08 34.29 22.13 47 20.34 L47 18 C47 16.34 48.34 15 50 15 Z M35 85 C35 90.52 39.48 95 45 95 L55 95 C60.52 95 65 90.52 65 85 L35 85 Z"
      `;
    }

    // Define the model to use
    const modelName = "gemini-1.5-flash";

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: systemPrompt + `\n\n${isCreationRequest ? 'Creation' : 'Edit'} request: ${userRequest}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: isCreationRequest ? 0.7 : 0.4, // Higher temperature for creation
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    
    // Extract the response text from Gemini
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON object from the response
    let jsonResponseText = responseText;
    
    // Remove markdown code blocks if present
    if (jsonResponseText.includes("```json")) {
      jsonResponseText = jsonResponseText.split("```json")[1].split("```")[0].trim();
    } else if (jsonResponseText.includes("```")) {
      jsonResponseText = jsonResponseText.split("```")[1].split("```")[0].trim();
    }
    
    // Parse the JSON response
    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonResponseText);
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      console.log("Raw response:", responseText);
      
      // Attempt to extract path data using regex as fallback
      const pathRegex = /M[\d\s.LMHVCSQTAZlmhvcsqtaz,-]+/g;
      const matches = responseText.match(pathRegex);
      
      if (matches && matches.length > 0) {
        return {
          success: true,
          modifiedData: matches[0].trim(),
          message: "I've updated the icon based on your request."
        };
      }
      
      return {
        success: false,
        modifiedData: svgData,
        message: "I couldn't parse the response properly. Please try again."
      };
    }
    
    // Extract path, message, and modifications from the JSON response
    const newPathData = aiResponse.path;
    const responseMessage = aiResponse.message;
    const modifications = aiResponse.modifications || [];
    
    // If AI provided manual modifications but not a complete path,
    // apply the modifications to the original path
    if (!newPathData && modifications.length > 0) {
      let modifiedPath = svgData;
      let modificationMessage = "I've made these changes:\n";
      
      // Apply each modification sequentially
      modifications.forEach(mod => {
        const result = modifyParameter(
          modifiedPath, 
          mod.segmentIndex, 
          mod.parameter, 
          mod.newValue
        );
        
        if (result.success) {
          modifiedPath = result.modifiedData;
          modificationMessage += `- Changed ${mod.parameter} in segment ${mod.segmentIndex + 1} from ${mod.oldValue} to ${mod.newValue}\n`;
        }
      });
      
      return {
        success: true,
        modifiedData: modifiedPath,
        message: responseMessage || modificationMessage
      };
    }
    
    if (newPathData) {
      return {
        success: true,
        modifiedData: newPathData,
        message: responseMessage || "I've updated the icon based on your request."
      };
    } else {
      return {
        success: false,
        modifiedData: svgData,
        message: responseMessage || "I couldn't generate a modified SVG path. Could you provide more details?"
      };
    }
  } catch (error) {
    console.error('Error processing SVG edit request:', error);
    return {
      success: false,
      modifiedData: svgData,
      message: "There was an error processing your request."
    };
  }
};

// Fallback function for direct SVG modifications (when parametric approach fails)
export const directSvgModify = (svgData, modifications) => {
  try {
    const segments = parseSvgPath(svgData);
    let modifiedPath = svgData;
    
    modifications.forEach(mod => {
      const result = modifyParameter(
        modifiedPath, 
        mod.segmentIndex, 
        mod.parameter, 
        mod.newValue
      );
      
      if (result.success) {
        modifiedPath = result.modifiedData;
      }
    });
    
    return {
      success: true,
      modifiedData: modifiedPath
    };
  } catch (error) {
    console.error('Error applying direct SVG modifications:', error);
    return {
      success: false,
      modifiedData: svgData
    };
  }
};