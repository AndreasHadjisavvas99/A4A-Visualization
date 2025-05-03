import { sendGraphQLRequest } from "./utils";

export const getVisualizationQuery = `
query getVisualization($id: String!) { 
    visualization(id: $id) { 
        id
        name
        analysisGoal
        splitBy
        axisLabels
        layout { 
            __typename  
            ... on Bar {
                id bookmark bargap barmode color hasText opacity orientation traceName
            }
            ... on Line {
                id bookmark color fill mode opacity orientation traceName
            }
            ... on Pie {
                id bookmark opacity palette traceName hole
            }
            ... on Histogram {
                id bookmark bargap barmode color opacity orientation traceName
            }
            ... on ScatterPolar {
                id bookmark color fill opacity traceName
            }
            ... on Box {
                id bookmark boxmean boxpoints color jitter opacity orientation traceName
            }
            ... on Violin {
                id bookmark box color meanline opacity traceName
            }
            ... on Heatmap {
                id bookmark opacity traceName
            }
        }
    } 
}`;




export const layoutFetchMap = {
    Bar: `
        query {
            bars {
                id
                traceName
                templateName
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
            lines {
                id
                traceName
                templateName
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
            pies {
                id
                traceName
                templateName
                bookmark
                palette
                opacity
                hole
            }
        }
    `,
    ScatterPolar: `
        query {
            scatterPolars {
                id
                traceName
                templateName
                bookmark
                opacity
                color
                fill
            }
        }
    `,
    Violin: `
        query {
            violins {
                id
                traceName
                templateName
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
            boxes {
                id
                traceName
                templateName
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
            histograms {
                id
                traceName
                templateName
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
            heatmaps {
                id
                traceName
                templateName
                bookmark
                opacity
            }
        }
    `
};

const mutationMap = {
    Bar: `
      mutation createBar($input: BarInput!) {
        createBar(input: $input) {
          id
          traceName
          templateName
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
      mutation createLine($input: LineInput!) {
        createLine(input: $input) {
          id
          traceName
          templateName
          bookmark
          opacity
          color
          mode
          fill
        }
      }
    `,
    Pie: `
      mutation createPie($input: PieInput!) {
        createPie(input: $input) {
          id
          traceName
          templateName
          bookmark
          palette
          opacity
          hole
        }
      }

    `,
    ScatterPolar: `
      mutation createScatterpolar($input: ScatterPolarInput!) {
        createScatterpolar(input: $input) {
          id
          traceName
          templateName
          bookmark
          opacity
          color
          fill
        }
      }
    `,
    Violin: `
      mutation createViolin($input: ViolinInput!) {
        createViolin(input: $input) {
          id
          traceName
          templateName
          bookmark
          opacity
          color
          meanline
          box
        }
      }
    `,
    Box: `
      mutation createBox($input: BoxInput!) {
        createBox(input: $input) {
          id
          traceName
          templateName
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
      mutation createHistogram($input: HistogramInput!) {
        createHistogram(input: $input) {
          id
          traceName
          templateName
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
      mutation createHeatmap($input:HeatmapInput!) {
        createHeatmap(input: $input) {
          id
          traceName
          templateName
          bookmark
          opacity
        }
      }
    `,
};

const updateMutationMap = {
  Bar: `
    mutation updateBar($id: String!, $input: BarInput!) {
      updateBar(id: $id, input: $input) {
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
  `,
  Line: `
    mutation updateLine($id: String!, $input: LineInput!) {
      updateLine(id: $id, input: $input) {
        id
        traceName
        color
        opacity
        mode
        fill
      }
    }
  `,
  Pie: `
    mutation updatePie($id: String!, $input: PieInput!) {
      updatePie(id: $id, input: $input) {
        id
        traceName
        opacity
        palette
        hole
      }
    }
  `,
  ScatterPolar: `
    mutation updateScatterpolar($id: String!, $input: ScatterPolarInput!) {
      updateScatterpolar(id: $id, input: $input) {
        id
        traceName
        opacity
        color
        fill
      }
    }
  `,
  Violin: `
    mutation updateViolin($id: String!, $input: ViolinInput!) {
      updateViolin(id: $id, input: $input) {
        id
        traceName
        opacity
        color
        meanline
        box
      }
    }
  `,
  Box: `
    mutation updateBox($id: String!, $input: BoxInput!) {
      updateBox(id: $id, input: $input) {
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
  `,
  Histogram: `
    mutation updateHistogram($id: String!, $input: HistogramInput!) {
      updateHistogram(id: $id, input: $input) {
        id
        traceName
        opacity
        color
        orientation
        barmode
        bargap
      }
    }
  `,
  Heatmap: `
    mutation updateHeatmap($id: String!, $input: HeatmapInput!) {
      updateHeatmap(id: $id, input: $input) {
        id
        traceName
        opacity
      }
    }
  `,
};

const createVisualizationMutation = `
  mutation CreateVisualization($input: VisualizationInput!) {
    createVisualization(input: $input) {
      id
      name
      axisLabels
      analysisGoal
      splitBy
      dateCreated
      dateUpdated
    }
}`;

export const deleteVisualizationMutation = `
  mutation deleteVisualization($id: String!) {
    deleteVisualization(id: $id) 
  }
`;

export const updateVisualizationMutation = `
  mutation UpdateVisualization($id: ID!, $data: VisualizationInput!) {
    updateVisualization(id: $id, data: $data) {
      success
      visualization {
        id
        name
      }
    }
  }
`;



export const handleSaveVisualization = async (
  selectedAnalysis,
  traceConfigs,
  chartTypes,
  sendGraphQLRequest,
  customTitle,
  xAxisTitle,yAxisTitle,zAxisTitle,
  splitTitle,
  existingVisId = null
) => {
  let layoutIds = [];
  let layoutCreationSucceeded = true;

  for (let i = 0; i < traceConfigs.length; i++) {
    const { templateName, ...cleanedTrace } = traceConfigs[i]; // ⬅️ remove templateName

    const trace = {
      ...cleanedTrace,
      ...(existingVisId ? {} : { id: undefined })
    };

    const mutation = mutationMap[chartTypes[i]];
    const variables = { input: trace };
      
    try {
      const result = await sendGraphQLRequest(mutation, variables);
      if (result) {
        const key = Object.keys(result.data)[0];
        const createResponse = result.data[key];
        

        if (createResponse.id) {
          const layoutId = createResponse.id;
          layoutIds.push(layoutId);
          traceConfigs[i].id = layoutId; //update the trace with the layout id
        } else {
          console.error("❌ Missing ID in response:", createResponse);
          layoutCreationSucceeded = false;
        }
      } else {
        console.error("❌ No data in response:", result);
        layoutCreationSucceeded = false;
      }
    } catch (error) {
      console.error("❌ Error during GraphQL request:", error);
      layoutCreationSucceeded = false;
    }
  }
  if (!layoutCreationSucceeded || layoutIds.length === 0) {
    return false; // ❌ Layout creation failed, don’t proceed to visualization
  }

  const visualizationDoc = {
    ...(existingVisId && { id: existingVisId }),
    name: customTitle,
    axisLabels: [xAxisTitle, yAxisTitle],
    analysisGoal: selectedAnalysis,
    layout: layoutIds,
    splitBy: splitTitle,
  };
  try {
    console.log("Sending mutation for visualization:", createVisualizationMutation);
    console.log("With variables:", { input: visualizationDoc });

    const visualizationResult = await sendGraphQLRequest(createVisualizationMutation, {
      input: visualizationDoc,
    });

    if (visualizationResult) {
      console.log("Full GraphQL result:", visualizationResult);
      const createResponse = visualizationResult.data?.createVisualization;
      if (createResponse?.id) {
        return createResponse.id;
      } else {
        console.error("❌ Failed to save visualization:", createResponse);
        console.error("❌ Full GraphQL response:", visualizationResult);
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

export const handleUpdateVisualization = async (
    selectedVisualizationId,
    selectedAnalysis,
    traceConfigs,
    chartTypes,
    sendGraphQLRequest,
    customTitle,
    columnNames,
    splitTitle,
  ) => {
    const layoutIds = [];
  
    for (let i = 0; i < traceConfigs.length; i++) {
      const mutation = mutationMap[chartTypes[i]];
      const variables = { data: traceConfigs[i] };
  
      try {
        const { data } = await sendGraphQLRequest(mutation, variables);
        const response = data?.[`create${chartTypes[i]}`];
        const layout = response?.[chartTypes[i].toLowerCase()];
  
        if (response?.success && layout?.id) {
          layoutIds.push(layout.id);
        } else {
          console.error("❌ Layout creation failed:", response);
          return false;
        }
      } catch (error) {
        console.error("❌ Error creating layout:", error);
        return false;
      }
    }
  
    const updatedVisualization = {
      name: customTitle,
      axisLabels: [columnNames[0], columnNames[1]],
      analysisGoal: selectedAnalysis,
      layout: layoutIds,
      splitBy: splitTitle,
      dateUpdated: new Date().toISOString(),
    };
  
    try {
      const { data } = await sendGraphQLRequest(updateVisualizationMutation, {
        id: selectedVisualizationId,
        data: updatedVisualization,
      });
  
      const result = data?.updateVisualization;
  
      if (result?.success) {
        console.log("✅ Visualization updated! ID:", result.visualization.id);
        return true;
      } else {
        console.error("❌ Update failed:", result);
        return false;
      }
    } catch (error) {
      console.error("❌ Error updating visualization:", error);
      return false;
    }
  };
  

export const saveTraceToDB = async (trace, chartType) => {
  const mutation = mutationMap[chartType];
  const variables = {
    input: {
      ...trace,
      bookmark: true,
    },
  };
  try {
    const result = await sendGraphQLRequest(mutation, variables);
    const saved = result?.input?.[`create${chartType}`]?.[chartType.toLowerCase()];
    return saved || null;
  } catch (error) {
      console.error("❌ Error creating trace:", error);
      return null;
  }
};
  

export const updateTraceInDB = async (selectedTrace, trace, chartType) => {
  const mutation = updateMutationMap[chartType];
  const { id, ...traceWithoutId } = trace;
  const variables = {
    id: selectedTrace,
    input: {
      ...traceWithoutId,
      bookmark: true,  
    },
  };

  try {
      const result = await sendGraphQLRequest(mutation, variables);
      return !!result?.data?.[`update${chartType}`];
  } catch (error) {
      console.error("❌ Error updating trace:", error);
      return false;
  }
};
  
export const deleteTraceFromDB = async (id, chartType) => {
  const mutation = `
      mutation Delete${chartType}($id: String!) {
          delete${chartType}(id: $id)
      }
  `;

  const variables = { id };

  try {
      const result = await sendGraphQLRequest(mutation, variables);
      return result?.data?.[`delete${chartType}`] || false;
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