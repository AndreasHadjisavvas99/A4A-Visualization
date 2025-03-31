import React, { useState, useEffect } from 'react';
import { generateColor, sendGraphQLRequest} from './utils';
import TraceCustomization from './TraceCustomization';
import Plot from 'react-plotly.js';
import { DataGrid} from "@mui/x-data-grid";
import {Button} from "@mui/material";
import { handleTitleChange,handleXAxisTitleChange, handleYAxisTitleChange, handleZAxisTitleChange, handleGlobalChartTypeChange} from './handles';
import { handleSaveVisualization, getVisualizationQuery, deleteVisualizationMutation} from './SaveVisualization';
import generatePlotData from "./generatePlotData";
import { COLOR_PALETTES, generatePieColors } from './utils';
import './styles.css';

const DataVis = () => {
    const [tableData, setTableData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [customTitle, setCustomTitle] = useState('Default Title');
    const [xAxisTitle, setXAxisTitle] = useState("");
    const [yAxisTitle, setYAxisTitle] = useState("");
    const [zAxisTitle, setZAxisTitle] = useState("");
    const [chartType, setChartType] = useState('Line');
    const [chartTypes, setChartTypes] = useState([]);
    const [traceConfigs, setTraceConfigs] = useState([]);
    const [columnData, setColumnData] = useState([]);  
    const [x_data, setXData] = useState([]);  
    const [y_data, setYData] = useState([]);
    const [z_data, setZData] = useState([]);
    const [layoutConfig, setLayoutConfig] = useState({ barmode: 'group', bargap: 0.1 });
    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [splitBy, setSplitBy] = useState("None"); 
    const [columnNames, setColumnNames] = useState([]);
    const [selectedXAxis, setSelectedXAxis] = useState("");
    const [selectedYAxis, setSelectedYAxis] = useState("");
    const [selectedZAxis, setSelectedZAxis] = useState("");
    const [analysisOptions, setAnalysisOptions] = useState([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState("");
    const [rows1,setRows1] = useState([]);
    const [columnNames1,setColumnNames1] = useState([]);
    const [selectedVisualization, setSelectedVisualization] = useState("");
    const [visualizationOptions, setVisualizationOptions] = useState([]);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [savedVisualizationId, setSavedVisualizationId] = useState(null);

    
    const resetState = () => {
        setTableData([]);
        setTableHeaders([]);
        setColumnNames([]);
        setXAxisTitle("");
        setYAxisTitle("");
        setZAxisTitle("");
        setCustomTitle("Default Title");
        setTraceConfigs([]);
        setChartTypes(prevChartTypes => new Array(prevChartTypes.length).fill("Line"));
        setChartType("Line");
        setColumnData([]);
        setXData([]);
        setYData([]);
        setZData([]);
        setAnalysisResults(null);
        setSelectedXAxis("");
        setSelectedYAxis("");
        setSelectedZAxis("");
        setError(null);
        setSavedVisualizationId(null);

    };
    // INPUT METHODS
    // 1. File Upload
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            
    
            resetState(); // Reset state before processing new file
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    
                    if (!data?.data?.resultRequest || data.data.resultRequest.length === 0) {
                        setError("Invalid JSON format");
                        return;
                    }
                    
                    const results = data.data.resultRequest[0].results;
                    
                    if (results.length === 0) {
                        setError("No results found.");
                        return;
                    }
                    const detectedColumns = Object.keys(results[0]);
                    
                    setColumnNames(detectedColumns);
                    setAnalysisResults(results);
                    populateTable(results);
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please select a valid JSON file');
        }
    };
    // 2. API QUERY
    const fetchAnalysisResults = async () => {
        setLoading(true);
        setError(null);
        resetState(); // Clear previous state
        
        const query = `
        query analysis_query {
            resultRequest(request: { request: "${selectedAnalysis}", requestFrom: "DA" }) {
                results
                reason
            }
        }`;
    
        try {
        
            const result = await sendGraphQLRequest(query, {});
            
            if (result?.data?.resultRequest?.length > 0) {
                const data = result.data.resultRequest[0].results;
                
                if (data.length === 0) {
                    setError("No results found.");
                    return;
                }
                const detectedColumns = Object.keys(data[0]);
    
                setColumnNames(detectedColumns);
                setAnalysisResults(data);
                populateTable(data);
            } else {
                setAnalysisResults(null);
                setError("No results found.");
            }
        } catch (err) {
            console.error("Error fetching results:", err);
            setError("Failed to fetch results.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async () => {
        const id = await handleSaveVisualization(
            selectedAnalysis,
            traceConfigs,
            chartTypes,
            sendGraphQLRequest,
            customTitle,
            xAxisTitle,yAxisTitle,zAxisTitle,
            splitBy
        );
        if (id) {
            console.log("Visualization saved successfully!");
            setSavedVisualizationId(id);
            setSaveSuccess("saved");
        } else {
            setSaveSuccess("error");
        }
        setTimeout(() => setSaveSuccess(null), 3000);
        fetchVisualizationOptions();
    };

    const handleUpdate = async () => {
        if (!savedVisualizationId) {
            console.warn("⚠ No visualization ID found — can't update. Did you save first?");
            setSaveSuccess("error");
            setTimeout(() => setSaveSuccess(null), 3000);
            return;
        }
        console.log("🔄 Updating current visualization...");
        const id = await handleSaveVisualization(
            selectedAnalysis,
            traceConfigs,
            chartTypes,
            sendGraphQLRequest,
            customTitle,
            xAxisTitle,yAxisTitle,zAxisTitle,
            splitBy,
            savedVisualizationId // <-- pass the ID here!
        );
        if (id) {
            console.log("✅ Visualization updated!");
            setSaveSuccess("updated");
        } else {
            setSaveSuccess("error");
        }
        setTimeout(() => setSaveSuccess(null), 3000);
        fetchVisualizationOptions();
    };

    const handleDelete = async () => {
        try {
          // Step 1: Get layout references
          const variables = { id: savedVisualizationId };
          const visResult = await sendGraphQLRequest(getVisualizationQuery, variables);
          console.log("result ", visResult);
          const layouts = visResult?.data?.visualization?.layout || [];
      
          // Step 2: Delete layouts
          for (const layout of layouts) {
            if (!layout.bookmark) {
              const deleteMutation = `
                mutation DeleteLayout($id: String!) {
                  deleteLayout(id: $id)
                }
              `;
      
              console.log(`Deleting layout with ID: ${layout}`);
              const response = await sendGraphQLRequest(deleteMutation, { id: layout.id });
              console.log("Layout deletion response:", response);
            }
          }
      
          // Step 3: Delete the visualization
          const visDeleteRes = await sendGraphQLRequest(deleteVisualizationMutation, {
            id: savedVisualizationId,
          });
      
          console.log("Visualization deletion response:", visDeleteRes);
      
          fetchVisualizationOptions();
          setSavedVisualizationId(null);
          setSaveSuccess("deleted");
          setTimeout(() => setSaveSuccess(null), 3000);
        } catch (error) {
          console.error("❌ Error in handleDelete:", error);
        }
      };
      

          
      
      


    const populateTable = (results) => {
    
        if (!results || results.length === 0) return;
    
        const keys = Object.keys(results[0]);
    
        // Format rows dynamically
        const formattedRows = results.map((item, index) => ({
            id: index,  
            ...item     
        }));
        const formattedColumns = keys.map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            width: 150,
        }));
    
        setRows1(formattedRows);
        setColumnNames1(formattedColumns);
    };
    
    const handlePrintTrace = (e) => {
        console.log(traceConfigs);
    };

    
    // const plotData = generatePlotData(x_data, y_data, z_data, traceConfigs, chartTypes, generateColor);
    const plotData = generatePlotData(x_data, y_data, z_data, traceConfigs, chartTypes, generateColor, generatePieColors, COLOR_PALETTES);
        
    const handleApply = () => {
        if (!analysisResults || analysisResults.length === 0) {
            console.error("No analysis results available.");
            setError("No data to apply. Please fetch results first.");
            return;
        }
    
        if (!selectedXAxis || !selectedYAxis) {
            console.error("Missing selected axes.");
            setError("Please select both X and Y axes.");
            return;
        }
    
        let groupedTraces = {};
        let traces = [];
    
        let xAxisTitle = selectedXAxis;
        let yAxisTitle = selectedYAxis !== "None" ? selectedYAxis : "";
        let zAxisTitle = selectedZAxis !== "None" ? selectedZAxis : "";
        let customTitle = "No Title"; 
    
        // Group traces by splitBy
        analysisResults.forEach((item) => {
            const traceName = item[splitBy] || "Default";
    
            if (!groupedTraces[traceName]) {
                groupedTraces[traceName] = { x: [], y: [], z: [] };
            }
    
            groupedTraces[traceName].x.push(item[selectedXAxis]);
            groupedTraces[traceName].y.push(item[selectedYAxis] ?? null);
            groupedTraces[traceName].z.push(item[selectedZAxis] ?? null);
        });
    
        // Convert grouped data into arrays
        const newXData = Object.values(groupedTraces).map(trace => trace.x);
        const newYData = selectedYAxis === "None" ? [] : Object.values(groupedTraces).map(trace => trace.y);
        const newZData = selectedZAxis === "None" ? [] : Object.values(groupedTraces).map(trace => trace.z);
    
        // Create trace configurations
        traces = Object.keys(groupedTraces).map((traceName, index) => {
            const existing = traceConfigs.find(tc => tc.traceName === traceName);
            return {
                ...(existing?.id && { id: existing.id }), // 👈 Preserve existing layout ID
                traceName,
                color: generateColor(index, Object.keys(groupedTraces).length),
                bookmark: false,
            };
        });
    
        // Apply extracted data to the state
        setXAxisTitle(xAxisTitle);
        setYAxisTitle(yAxisTitle);
        setZAxisTitle(zAxisTitle);
        setCustomTitle(customTitle);
        setTraceConfigs(traces);
        setChartTypes(Array(traces.length).fill("Line"));
        setXData(newXData);
        setYData(newYData);
        setZData(newZData);
    };

    const fetchVisualizationOptions = async () => {
        setLoading(true);
        setError(null);
    
        const query = `
        query qAllVisualizations { 
            visualizations { 
                id
                name
            } 
        }`;
    
        try {
            const result = await sendGraphQLRequest(query, {});
    
            if (result?.data?.visualizations) {
                setVisualizationOptions(result.data.visualizations);
            } else {
                setError("No visualizations found.");
            }
        } catch (err) {
            console.error("Error fetching visualizations:", err);
            setError("Failed to fetch visualizations.");
        } finally {
            setLoading(false);
        }
    };

    const fetchVisualization = async () => {
        if (!selectedVisualization) return;
    
        setLoading(true);
        setError(null);
    
        try {
            const variables = { id: selectedVisualization };
            const result = await sendGraphQLRequest(getVisualizationQuery, variables);
            console.log("aaa", result);
            if (result?.data?.visualization) {
                const vizData = result.data.visualization;
                const id = result.data.visualization.id;
                setSavedVisualizationId(id);
                setSelectedAnalysis(vizData.analysisGoal);
                fetchAnalysisResults();
                const extractedPlotTypes = vizData.layout.map((trace) => trace.__typename);
                
                const splitField = vizData.splitBy || "Default";
                const selectedXAxis = vizData.axisLabels[0];
                const selectedYAxis = vizData.axisLabels[1];
                const selectedZAxis = vizData.axisLabels[2];

                const groupedTraces = {};
                (analysisResults || []).forEach((item) => {
                    const traceName = item[splitField] || "Default";

                    if (!groupedTraces[traceName]) {
                        groupedTraces[traceName] = { x: [], y: [], z: [] };
                    }

                    const xValue = item[selectedXAxis] !== undefined ? item[selectedXAxis] : null;
                    const yValue = item[selectedYAxis] !== undefined ? item[selectedYAxis] : null;
                    const zValue = item[selectedZAxis] !== undefined ? item[selectedZAxis] : null;

                    groupedTraces[traceName].x.push(xValue);
                    groupedTraces[traceName].y.push(yValue);
                    groupedTraces[traceName].z.push(zValue);
                });

                const newXData = Object.values(groupedTraces).map(trace => trace.x);
                const newYData = selectedYAxis === "None" ? [] : Object.values(groupedTraces).map(trace => trace.y);
                const newZData = selectedZAxis === "None" ? [] : Object.values(groupedTraces).map(trace => trace.z);

                
                setXAxisTitle(vizData.axisLabels[0]);
                setYAxisTitle(vizData.axisLabels[1]);
                setCustomTitle(vizData.name);
                setChartTypes(extractedPlotTypes);
                setSplitBy(vizData.splitBy);
                setTraceConfigs(vizData.layout);
                setXData(newXData);
                setYData(newYData);
                setZData(newZData);
                setSavedVisualizationId(id);
                setLoading(false);
                
            } else {
                setError("Visualization not found.");
            }
        } catch (err) {
            console.error("Error fetching visualization:", err);
            setError("Failed to fetch visualization.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (selectedAnalysis) {
            fetchAnalysisResults();
        }
    }, [selectedAnalysis]);
    
    

    const fetchAnalysisOptions = async () => {
        setLoading(true);
        setError(null);
        
        const query = `
        query qAllAnalysis { 
            analyses { 
                id 
                analyticsGoal 
            } 
        }`;

        try {
            const result = await sendGraphQLRequest(query, {});
            
            if (result?.data?.analyses) {
                setAnalysisOptions(result.data.analyses);
            } else {
                setError("No analysis options found.");
            }
        } catch (err) {
            console.error("Error fetching analysis options:", err);
            setError("Failed to fetch analysis options.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        setTableHeaders(["Trace Label", xAxisTitle, yAxisTitle, zAxisTitle]);
    }, [x_data, y_data, z_data, xAxisTitle, yAxisTitle, zAxisTitle]);
    useEffect(() => {
        fetchAnalysisOptions();
        fetchVisualizationOptions();
    }, []);
    
    

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
        {/* LEFT COLUMN: Data Table & Advanced Customization */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            
            {/* File Upload Section (Added Back) */}
            <section id="file-upload" className="section">
                <h3>Upload JSON File</h3>
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="file-input"
                />
            </section>
            <section id="select-analysis">
                <label>Select Analysis:</label>
                <select
                    id="analysis-select"
                    value={selectedAnalysis}
                    onChange={(e) => {
                        setSelectedAnalysis(e.target.value);
                    }}
                >
                    <option value="">Select an Analysis</option>
                    {analysisOptions.map((option) => (
                        <option key={option.id} value={option.analyticsGoal}>
                            {option.analyticsGoal}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => fetchAnalysisResults(selectedAnalysis)}
                    disabled={!selectedAnalysis}
                >
                    Fetch Results
                </button>
            </section>

            <section id="axis-selection">
                <div>
                    <label>X Axis: </label>
                    <select value={selectedXAxis} onChange={(e) => setSelectedXAxis(e.target.value)}>
                        <option value="">None</option>
                        {columnNames.map((col, index) => (
                            <option key={index} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Y Axis: </label>
                    <select value={selectedYAxis} onChange={(e) => setSelectedYAxis(e.target.value)}>
                        <option value="">None</option>
                        {columnNames.map((col, index) => (
                            <option key={index} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Z Axis: </label>
                    <select value={selectedZAxis} onChange={(e) => setSelectedZAxis(e.target.value)}>
                        <option value="">None</option> {/* This option was already present */}
                        {columnNames.map((col, index) => (
                            <option key={index} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Split By: </label>
                    <select value={splitBy} onChange={(e) => setSplitBy(e.target.value)}>
                        <option value="None">None</option>
                        {columnNames.map((col, index) => (
                            <option key={index} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleApply}> Apply </button>
            </section>

            {/*Load Existing Visualization*/}
            <section id="axis-selection">
                <label>Select a Visualization:</label>
                <select
                    value={selectedVisualization}
                    onChange={(e) => setSelectedVisualization(e.target.value)}
                >
                    <option value="">Select a Visualization</option>
                    {visualizationOptions.map((viz) => (
                        <option key={viz.id} value={viz.id}>{viz.name}</option>
                    ))}
                </select>
                <button 
                    onClick={fetchVisualization} 
                    disabled={!selectedVisualization}
                >
                    Load Visualization
                </button>
            </section>

            {/* Data Table */}
            <section id="data-display" className="data-display" style={{ flex: 1 }}>
                <h2>{customTitle}</h2>
                <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={rows1}
                        columns={columnNames1}
                        pageSize={5}
                        getRowId={(row) => row.id}
                    />
                </div>
            </section>

            {/* Advanced Customization */}
            <section id="advanced-customization">
                <TraceCustomization 
                    traceConfigs={traceConfigs} 
                    setTraceConfigs={setTraceConfigs}
                    chartTypes={chartTypes}
                    setChartTypes={setChartTypes}
                    layoutConfig={layoutConfig}
                    setLayoutConfig={setLayoutConfig}
                />
            </section>

        </div>

        {/* RIGHT COLUMN: Customization & Chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Customization Section */}
            <section id="customization" className="customization-section">
                <h2>Customize</h2>

                <div className="form-group">
                    <label>Chart Title:</label>
                    <input type="text" value={customTitle} onChange={handleTitleChange(setCustomTitle)} />
                </div>

                <div className="form-group">
                    <label>X Axis Title:</label>
                    <input type="text" value={xAxisTitle} onChange={handleXAxisTitleChange(setXAxisTitle)} />
                </div>

                <div className="form-group">
                    <label>Y Axis Title:</label>
                    <input type="text" value={yAxisTitle} onChange={handleYAxisTitleChange(setYAxisTitle)} />
                </div>

                <div className="form-group">
                    <label>Z Axis Title:</label>
                    <input type="text" value={zAxisTitle} onChange={handleZAxisTitleChange(setZAxisTitle)} />
                </div>

                <div className="form-group">
                    <label>Chart Type:</label>
                    <select value={chartType} onChange={handleGlobalChartTypeChange(setChartTypes, setTraceConfigs, setChartType)}>
                    <option value="Line">Line</option>
                    <option value="Bar">Bar</option>
                    <option value="Pie">Pie</option>
                    <option value="ScatterPolar">Radar</option>
                    <option value="Violin">Violin</option>
                    <option value="Box">Box</option>
                    <option value="Histogram">Histogram</option>
                    <option value="Heatmap">Heatmap</option>
                    </select>
                </div>

                <div className="form-group">
                    <button onClick={handlePrintTrace}>View Trace Config</button>
                </div>
            </section>

            
            {/* Container for Plotly Chart and Bar Global Customization */}
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Plotly Chart Section */}
                <section id="plotly-chart" style={{ flex: 1 }}>
                    {traceConfigs.length > 0 ? (
                        <div className="plot-container">
                            <Plot
                                data={plotData}
                                layout={{
                                    title: { text: customTitle },
                                    xaxis: { title: { text: xAxisTitle } },
                                    yaxis: { title: { text: yAxisTitle } },
                                    bargap: layoutConfig.bargap,
                                    barmode: layoutConfig.barmode,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="no-chart-message">
                            <p>Upload a JSON file to see the chart here</p>
                        </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Button 
                            onClick={handleSave} 
                            variant="outlined"
                            color="primary"
                            disabled={traceConfigs.length === 0}>
                            Save Visualization
                        </Button>
                        <Button 
                            onClick={handleUpdate} 
                            variant="outlined"
                            color="secondary"
                            disabled={!savedVisualizationId}>
                            Update Visualization
                        </Button>
                        <Button 
                            onClick={handleDelete}
                            variant="outlined"
                            color="error"
                            disabled={!savedVisualizationId}
                        >
                            Delete Visualization
                        </Button>


                        {/* ✅ Show success message when saved */}
                        {saveSuccess === "saved" && (
                            <div style={{
                                padding: "5px",
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                border: "1px solid #c3e6cb",
                                borderRadius: "5px",
                                whiteSpace: "nowrap"
                            }}>
                                ✔ Saved Successfully!
                            </div>
                        )}
                        {saveSuccess === "updated" && (
                            <div style={{
                                padding: "5px",
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                border: "1px solid #c3e6cb",
                                borderRadius: "5px",
                                whiteSpace: "nowrap"
                            }}>
                                ✔ Updated Successfully!
                            </div>
                        )}
                        {saveSuccess === "deleted" && (
                            <div style={{
                                padding: "5px",
                                backgroundColor: "#f8d7da",
                                color: "#721c24",
                                border: "1px solid #f5c6cb",
                                borderRadius: "5px",
                                whiteSpace: "nowrap"
                            }}>
                                Deleted Successfully!
                            </div>
                        )}
                        {saveSuccess === "error" && (
                            <div style={{
                                padding: "5px",
                                backgroundColor: "#f8d7da",
                                color: "#721c24",
                                border: "1px solid #f5c6cb",
                                borderRadius: "5px",
                                whiteSpace: "nowrap"
                            }}>
                                ✖ Failed.
                            </div>
                        )}

                    </div>
                </section>

                {/* Bar Global Customization (Only Appears if there is a "Bar" chart) */}
                {chartTypes.includes("Bar") && (
                    <section 
                        id="bar-customization" 
                        style={{ 
                            padding: '10px', 
                            background: '#f8f9fa', 
                            borderRadius: '5px', 
                            marginTop: '20px',
                            position: 'relative' /* Ensures it stays in place */
                        }}>
                        <h3>Bar Settings</h3>
                        
                        <div className="form-group">
                            <label>Bar Mode:</label>
                            <select
                                value={layoutConfig.barmode || "group"}
                                onChange={(e) => setLayoutConfig({ ...layoutConfig, barmode: e.target.value })}
                                style={{ width: '100%' }}
                            >
                                <option value="group">Group</option>
                                <option value="stack">Stack</option>
                                <option value="overlay">Overlay</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Bar Gap:</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={layoutConfig.bargap || 0}
                                onChange={(e) => setLayoutConfig({ ...layoutConfig, bargap: parseFloat(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="form-group">  
                            <label>Show Text on Bars</label>
                            <input 
                                type="checkbox"
                                checked={traceConfigs.find((t, i) => chartTypes[i] === "Bar")?.hasText || false} 
                                onChange={(e) => {
                                    const newHasText = e.target.checked;
                                    setTraceConfigs((prevConfigs) =>
                                        prevConfigs.map((config, index) =>
                                            chartTypes[index] === "Bar"
                                                ? { ...config, hasText: newHasText }  // Update hasText for Bar charts
                                                : config
                                        )
                                    );
                                }}
                            />         
                        </div>

                    </section>
                )}
                {chartTypes.includes("Line") && (
                    <section 
                        id="line-customization" 
                        style={{ 
                            padding: '10px', 
                            background: '#f8f9fa', 
                            borderRadius: '5px', 
                            marginTop: '20px',
                            position: 'relative' /* Ensures it stays in place */
                        }}>
                        <h3>Line Settings</h3>
                        
                        <div className="form-group">
                            <label>Line Mode:</label>
                            <select
                                value={traceConfigs.find((t, i) => chartTypes[i] === "Line")?.mode || "lines"}
                                onChange={(e) => {
                                    const newMode = e.target.value.trim();
                                    setTraceConfigs((prevConfigs) =>
                                        prevConfigs.map((config, index) =>
                                            chartTypes[index] === "Line"
                                                ? { ...config, mode: newMode }
                                                : config
                                        )
                                    );
                                }}
                                style={{ width: '100%' }}
                            >
                                <option value="markers">Markers</option>
                                <option value="lines">Lines</option>
                                <option value="lines+markers">Lines and Markers</option>
                            </select>
                            <label>Line Fill</label>
                            <select
                                value={traceConfigs.find((t,i) => chartTypes[i] === "Line")?.fill || "none"}
                                onChange={(e) => {
                                    const newFill = e.target.value.trim();
                                    setTraceConfigs((prevConfigs) =>
                                        prevConfigs.map((config, index) =>
                                            chartTypes[index] === "Line"
                                                ? { ...config, fill: newFill }
                                                : config
                                        )
                                    );
                                }}
                            >
                                <option value="none">None</option>
                                <option value="tozeroy">To Zero Y</option>
                                <option value="tonexty">To Next Y</option>
                            </select>

                        </div>
                    </section>
                )}
            </div>
        </div>
    </div>
    );
};
export default DataVis;