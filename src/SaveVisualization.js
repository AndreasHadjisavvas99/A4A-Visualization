import { sendGraphQLRequest } from "./utils";

const layoutFetchMap = {
    Bar: `
        query {
            allBars {
                id
                traceName
                bookmark
                opacity
                color
                barmode
                bargap
                orientation
                hasText
            }
        }
    `,
    Line: `
        query {
            allLines {
                id
                traceName
                bookmark
                opacity
                color
                mode
                fill
            }
        }
    `,
    Pie: `
        query {
            allPies {
                id
                traceName
                bookmark
                palette
                opacity
                hole
            }
        }
    `,
    ScatterPolar: `
        query {
            allScatterpolars {
                id
                traceName
                bookmark
                opacity
                color
                fill
            }
        }
    `,
    Violin: `
        query {
            allViolins {
                id
                traceName
                bookmark
                opacity
                color
                meanline
                box
            }
        }
    `,
    Box: `
        query {
            allBoxes {
                id
                traceName
                bookmark
                opacity
                color
                orientation
                boxpoints
                jitter
                boxmean
            }
        }
    `,
    Histogram: `
        query {
            allHistograms {
                id
                traceName
                bookmark
                opacity
                color
                orientation
                barmode
                bargap
            }
        }
    `,
    Heatmap: `
        query {
            allHeatmaps {
                id
                traceName
                bookmark
                opacity
            }
        }
    `
};

const mutationMap = {
    Bar: `
        mutation createBar($data: BarInput!) {
            createBar(data: $data) {
                success
                bar {
                    id
                    traceName
                    bookmark
                    opacity
                    color
                    barmode
                    bargap
                    orientation
                    hasText
                }
            }
        }
    `,
    Line: `
        mutation createLine($data: LineInput!) {
            createLine(data: $data) {
                success
                line {
                    id
                    traceName
                    bookmark
                    opacity
                    color
                    mode
                    fill
                }
            }
        }
    `,
    Pie: `
        mutation createPie($data: PieInput!) {
            createPie(data: $data) {
                success
                pie {
                    id
                    traceName
                    bookmark
                    palette
                    opacity
                    hole
                }
            }
        }
    `,
    ScatterPolar: `
        mutation createScatterpolar($data: ScatterPolarInput!) {
            createScatterpolar(data: $data) {
                success
                scatterpolar {
                    id
                    traceName
                    bookmark
                    opacity
                    color
                    fill
                }
            }
        }
    `,
    Violin: `
        mutation createViolin($data: ViolinInput!) {
            createViolin(data: $data) {
                success
                violin {
                    id
                    traceName
                    bookmark
                    opacity
                    color
                    meanline
                    box
                }
            }
        }
    `,
    Box: `
        mutation createBox($data: BoxInput!) {
            createBox(data: $data) {
                success
                box {
                    id
                    traceName
                    bookmark
                    opacity
                    color
                    orientation
                    boxpoints
                    jitter
                    boxmean
                }
            }
        }
    `,
    Histogram: `
        mutation createHistogram($data: HistogramInput!) {
            createHistogram(data: $data) {
                success
                histogram {
                    id
                    traceName
                    bookmark
                    opacity
                    color
                    orientation
                    barmode
                    bargap
                }
            }
        }
    `,
    Heatmap: `
        mutation createHeatmap($data:HeatmapInput!) {
            createHeatmap(data: $data) {
                success
                heatmap {
                    id
                    traceName
                    bookmark
                    opacity
                }
            }
        }
    `,
};
const updateMutationMap = {
    Bar: `
      mutation updateBar($id: ID!, $data: BarInput!) {
        updateBar(id: $id, data: $data) {
          success
          bar {
            id
            traceName
            opacity
            color
            barmode
            bargap
            orientation
            hasText
          }
        }
      }
    `,
    Line: `
      mutation updateLine($id: ID!, $data: LineInput!) {
        updateLine(id: $id, data: $data) {
          success
          line {
            id
            traceName
            opacity
            color
            mode
            fill
          }
        }
      }
    `,
    Pie: `
      mutation updatePie($id: ID!, $data: PieInput!) {
        updatePie(id: $id, data: $data) {
          success
          pie {
            id
            traceName
            opacity
            palette
            hole
          }
        }
      }
    `,
    ScatterPolar: `
      mutation updateScatterpolar($id: ID!, $data: ScatterPolarInput!) {
        updateScatterpolar(id: $id, data: $data) {
          success
          scatterpolar {
            id
            traceName
            opacity
            color
            fill
          }
        }
      }
    `,
    Violin: `
      mutation updateViolin($id: ID!, $data: ViolinInput!) {
        updateViolin(id: $id, data: $data) {
          success
          violin {
            id
            traceName
            opacity
            color
            meanline
            box
          }
        }
      }
    `,
    Box: `
      mutation updateBox($id: ID!, $data: BoxInput!) {
        updateBox(id: $id, data: $data) {
          success
          box {
            id
            traceName
            opacity
            color
            orientation
            boxpoints
            jitter
            boxmean
          }
        }
      }
    `,
    Histogram: `
      mutation updateHistogram($id: ID!, $data: HistogramInput!) {
        updateHistogram(id: $id, data: $data) {
          success
          histogram {
            id
            traceName
            opacity
            color
            orientation
            barmode
            bargap
          }
        }
      }
    `,
    Heatmap: `
      mutation updateHeatmap($id: ID!, $data: HeatmapInput!) {
        updateHeatmap(id: $id, data: $data) {
          success
          heatmap {
            id
            traceName
            opacity
          }
        }
      }
    `,
  };
  
  
  
/*const createVisualizationMutation = `
    mutation createVisualization($data: VisualizationInput!) {
        createVisualization(data: $data) {
            success
            visualization {
                id
                name
                axisLabels
                analysisGoal
                splitBy
                dateCreated
                dateUpdated
            }
        }
    }
`; */

const createVisualizationMutation = `
    mutation CreateVisualization($data: VisualizationInput!) {
  createVisualization(data: $data) {
    visualization {
      id
      name
      axisLabels
      analysisGoal
      splitBy
      dateCreated
      dateUpdated
    }
  }
}`;



export const handleSaveVisualization = async (
    selectedAnalysis,
    traceConfigs,
    chartTypes,
    sendGraphQLRequest,
    customTitle,
    columnNames,
    splitTitle,
) => {
    let layoutIds = [];
    for (let i = 0; i < traceConfigs.length; i++) {
        const mutation = mutationMap[chartTypes[i]];
        const variables = { data: traceConfigs[i] };
        try {
            const result = await sendGraphQLRequest(mutation, variables);
            if (result) {
                const key = Object.keys(result.data)[0];
                const createResponse = result.data[key];
                const layoutData =
                    createResponse.line ||
                    createResponse.bar ||
                    createResponse.pie ||
                    createResponse.scatterpolar ||
                    createResponse.violin ||
                    createResponse.box ||
                    createResponse.histogram ||
                    createResponse.heatmap;

                if (createResponse.success && layoutData && layoutData.id) {
                    const layoutId = layoutData.id;
                    layoutIds.push(layoutId);
                } else {
                    console.error("❌ Missing ID in response:", createResponse);
                }
            } else {
                console.error("❌ No data in response:", result);
            }
        } catch (error) {
            console.error("❌ Error during GraphQL request:", error);
        }
    }

    const current_date = new Date().toISOString();
    const visualizationDoc = {
        name: customTitle,
        axisLabels: [columnNames[0], columnNames[1]],
        analysisGoal: selectedAnalysis,
        layout: layoutIds,
        splitBy: splitTitle,
        dateCreated: current_date,
        dateUpdated: current_date,
    };
    try {
        const visualizationResult = await sendGraphQLRequest(createVisualizationMutation, {
            data: visualizationDoc,
        });
        console.log(visualizationResult);

        if (visualizationResult) {
            const createResponse = visualizationResult.data.createVisualization;

            if (createResponse.success) {
                console.log("Visualization ID:", createResponse.visualization.id);
            } else {
                console.error("❌ Failed to save visualization:", createResponse);
            }
        } else {
            console.error("❌ No response from server.");
        }
    } catch (error) {
        console.error("❌ Error during visualization save:", error);
    }

    console.log("Layout IDs:", layoutIds);
    return true;
};



export const saveTraceToDB = async (trace, chartType) => {
    const mutation = mutationMap[chartType];
    const variables = {
      data: {
        ...trace,
        bookmark: true,
      },
    };
  
    try {
        const result = await sendGraphQLRequest(mutation, variables);
        const saved = result?.data?.[`create${chartType}`]?.[chartType.toLowerCase()];
        return saved || null;
    } catch (error) {
        console.error("❌ Error creating trace:", error);
        return null;
    }
};
  

export const updateTraceInDB = async (trace, chartType) => {
    const mutation = updateMutationMap[chartType];
    const variables = {
        id: trace.id, // ✅ required by your GraphQL schema
        data: {
          ...trace,
        },
    };
      

    try {
        const result = await sendGraphQLRequest(mutation, variables);
        console.log(result);
        return !!result?.data?.[`update${chartType}`];
    } catch (error) {
        console.error("❌ Error updating trace:", error);
        return false;
    }
};
  
export const deleteTraceFromDB = async (id, chartType) => {
    const mutation = `
        mutation Delete${chartType}($id: ID!) {
            delete${chartType}(id: $id) {
                success
            }
        }
    `;
    const variables = { id };
    
    try {
        const result = await sendGraphQLRequest(mutation, variables);
        return result?.data?.[`delete${chartType}`]?.success || false;
    } catch (error) {
        console.error(`❌ Error deleting ${chartType}:`, error);
        return false;
    }
};


export const fetchLayoutsByType = async (chartType) => {
    const query = layoutFetchMap[chartType];

    if (!query) {
        console.error(`❌ No query found for chart type: ${chartType}`);
        return [];
    }

    try {
        const result = await sendGraphQLRequest(query, {});
        if (result?.data) {
            const key = Object.keys(result.data)[0]; // Get the first key dynamically
            return result.data[key]; // Return fetched layouts
        } else {
            console.error(`❌ No layouts found for chart type: ${chartType}`);
            return [];
        }
    } catch (error) {
        console.error(`❌ Error fetching layouts for ${chartType}:`, error);
        return [];
    }
};