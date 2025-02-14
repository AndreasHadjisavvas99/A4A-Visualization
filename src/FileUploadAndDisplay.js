import React, { useState, useEffect } from 'react';
import { generateColor, extractData, sendGraphQLRequest, mutationMap, createVisualizationMutation} from './utils';
import TraceCustomization from './TraceCustomization';
import Plot from 'react-plotly.js';
import './styles.css';
import { Icons } from 'plotly.js';

const FileUploadAndDisplay = () => {
    const [tableData, setTableData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [customTitle, setCustomTitle] = useState('Default Title');
    const [xAxisTitle, setXAxisTitle] = useState();
    const [yAxisTitle, setYAxisTitle] = useState();
    const [zAxisTitle, setZAxisTitle] = useState();
    const [chartType, setChartType] = useState('Line');
    const [advancedMode, setAdvancedMode] = useState(false);
    const [chartTypes, setChartTypes] = useState([]);
    const [traceConfigs, setTraceConfigs] = useState([]);
    const [x_data, setXData] = useState([]);  
    const [y_data, setYData] = useState([]);
    const [z_data, setZData] = useState([]);
    const [layoutConfig, setLayoutConfig] = useState({ barmode: 'group', bargap: 0.1 });
    
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {

            try {
            const data = JSON.parse(reader.result);
            const { tableRows, chartTypesList, xAxisTitle, yAxisTitle, zAxisTitle, customTitle, traces, x_data, y_data, z_data } = extractData(data);
            setXAxisTitle(xAxisTitle);
            setYAxisTitle(yAxisTitle);
            setZAxisTitle(zAxisTitle);
            setCustomTitle(customTitle);
            setTraceConfigs(traces);
            setTableData(tableRows);
            console.log(tableRows);
            setChartTypes(chartTypesList);
            setXData(x_data);
            setYData(y_data);
            setZData(z_data);
            setTableHeaders([ "Trace Label", xAxisTitle, yAxisTitle,zAxisTitle ]);
            } catch (error) {
            alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
        } else {
        alert('Please select a JSON file');
        }
    };
    const handlePrintTrace = (e) => {
        console.log(chartTypes);
    };
    const handleTitleChange = (e) => setCustomTitle(e.target.value);
    const handleXAxisTitleChange = (e) => setXAxisTitle(e.target.value);
    const handleYAxisTitleChange = (e) => setYAxisTitle(e.target.value);
    const handleZAxisTitleChange = (e) => setZAxisTitle(e.target.value);

    const handleGlobalChartTypeChange = (e) => {
        const newChartType = e.target.value;
        
        setChartTypes(prevChartTypes => {
            const updatedChartTypes = Array(prevChartTypes.length).fill(newChartType);
            return updatedChartTypes;
        });
        setChartType(newChartType);
    };


    const handleAdvancedCustomizationToggle = () => {
        setAdvancedMode((prevMode) => {
            const newMode = !prevMode; 
            setTraceConfigs((prevTraces) => {
                return prevTraces.map(trace => {
                    if (newMode) {
                        return trace;
                    } else {
                        return {
                            traceName: trace.traceName,
                            color: trace.color
                        };
                    }
                });
            });
    
            return newMode;
        });
    };

    useEffect(() => {
        setTableHeaders([ "Trace Label", xAxisTitle, yAxisTitle, zAxisTitle ]);
    }, [xAxisTitle, yAxisTitle, zAxisTitle]);


    const plotData = x_data.map((x, index) => {
        const traceConfig = traceConfigs[index] || {};
        const chartType = chartTypes[index]?.toLowerCase(); //Plotly recognises only lowercase chartypes
        const trace = {
            type: chartType,  
            x: x,  
            y: y_data[index], 
            name: traceConfig.traceName || `Trace ${index + 1}`, 
            marker: {
                color: traceConfig.color || generateColor(index, x_data.length), 
            },
            orientation: traceConfig.orientation,
        }
        if (traceConfig.mode) trace.mode = traceConfig.mode;  
        if (traceConfig.opacity) trace.opacity = traceConfig.opacity; 
        if (traceConfig.fill) trace.fill = traceConfig.fill;
        if (traceConfig.orientation) trace.orientation = traceConfig.orientation;
        if (traceConfig.barmode) trace.barmode = traceConfig.barmode;
        if (traceConfig.bargap) trace.bargap = traceConfig.bargap;
        if (traceConfig.hasText) {
            trace.text = trace.y;       
            trace.textposition = 'auto';
        }
        return trace;
    });
    
    const handleSaveVisualization = async () => {
        let layoutIds = [];
    
        for (let i = 0; i < traceConfigs.length; i++) {
            const mutation = mutationMap[chartTypes[i]]; 
            const variables = { data: traceConfigs[i] };  
            try { 
                console.log(variables);
                const result = await sendGraphQLRequest(mutation, variables);
    
                if (result) {
                    const key = Object.keys(result.data)[0];  
                    const createResponse = result.data[key];
                    const layoutData = createResponse.line || createResponse.bar;
    
                    if (createResponse.success && layoutData && layoutData.id) {
                        const layoutId = layoutData.id;
                        layoutIds.push(layoutId);
                        //console.log(`✅ Saved successfully! ID: ${layoutId}`);
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

        const visualizationDoc = {
            name: customTitle,
            inputData: x_data.map((x, i) => ({ x, y: y_data[i] })),
            plotType: chartTypes,
            axisLabels: [xAxisTitle, yAxisTitle],
            layout: layoutIds,  
        };
        try {
            const visualizationResult = await sendGraphQLRequest(createVisualizationMutation, {
                data: visualizationDoc,
            });
    
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
    };
    
    
    

    return (
        <div style={{ display: 'flex', gap: '10px', padding: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* File Upload Section */}
                <section id="file-upload" style={{ width: '200px', marginBottom: '20px' }}>
                    <h3>Upload JSON File</h3>
                    <input type="file" onChange={handleFileChange} style={{ width: '100%', padding: '5px' }} />
                </section>
                {/* Data Display Table */}
                <section id="data-display" className="data-display">
                    <h2>{customTitle}</h2>
                    <div className="table-container">
                        <table id="data-table">
                            <thead>
                                <tr>
                                    {tableHeaders.map((header, index) => (
                                        <th key={index}>
                                            {header}
                                        </th>
                                    ))}

                                </tr>
                            </thead>
                        </table>

                        {/* Scrollable Body Wrapper */}
                        <div className="scrollable-body">
                            <table id="data-table-body">
                                <tbody>
                                    {tableData.map((trace, traceIndex) => {
                                        const xValues = trace.x.split(",").map(item => item.trim());
                                        const yValues = trace.y.split(",").map(item => item.trim());
                                        return (
                                            <React.Fragment key={traceIndex}>
                                                <tr className="trace-header">
                                                    <td colSpan="4" className="trace-name">
                                                        {trace.name}
                                                    </td>
                                                </tr>

                                                {xValues.map((xVal, index) => (
                                                    <tr key={index}>
                                                        <td>{trace.name}</td>
                                                        <td>{xVal}</td>
                                                        <td>{yValues[index] || "N/A"}</td>
                                                        <td>{trace.z}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
            


            {/* Customization Section */}
            <section id="customization" className='customization-section'>
                <h2>Customize</h2>

                <div className='form-group'>
                <label>Chart Title:</label>
                <input type="text" value={customTitle} onChange={handleTitleChange} style={{ width: '100%' }} />
                </div>

                <div className='form-group'>
                <label>X Axis Title:</label>
                <input type="text" value={xAxisTitle} onChange={handleXAxisTitleChange} style={{ width: '100%' }} />
                </div>

                <div className='form-group'>
                <label>Y Axis Title:</label>
                <input type="text" value={yAxisTitle} onChange={handleYAxisTitleChange} style={{ width: '100%' }} />
                </div>

                <div className='form-group'>
                <label>Z Axis Title:</label>
                <input type="text" value={zAxisTitle} onChange={handleZAxisTitleChange} style={{ width: '100%' }} />
                </div>

                {!advancedMode && (
                    <div className='form-group'>
                        <label>Chart Type:</label>
                        <select value={chartType} onChange={handleGlobalChartTypeChange}>
                            <option value="Line">Line</option>
                            <option value="Bar">Bar</option>
                            <option value="Pie">Pie</option>
                            <option value="Radar">Radar</option>
                            <option value="Violin">Violin</option>
                            <option value="Box">Box</option>
                            <option value="Histogram">Histogram</option>
                            <option value="Heatmap">Heatmap</option>
                        </select>
                    </div>
                )}
                <div className='form-group'>
                    <button onClick={handlePrintTrace}>View Trace Config</button>
                </div>
                {/* Advanced Customization Button */}
                <div className='form-group'>
                    <button onClick={handleAdvancedCustomizationToggle} style={{ width: '100%', padding: '8px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
                        {advancedMode ? '➖ Hide Advanced Customization' : '➕ Show Advanced Customization'}
                    </button>
                </div>
                {advancedMode && (
                    <TraceCustomization 
                        traceConfigs={traceConfigs} 
                        setTraceConfigs={setTraceConfigs} 
                        chartType={chartType}
                        setChartType={setChartType}
                        chartTypes={chartTypes}
                        setChartTypes={setChartTypes}
                        advancedMode={advancedMode}
                        setAdvancedMode={setAdvancedMode}
                        layoutConfig={layoutConfig}
                        setLayoutConfig={setLayoutConfig}
                    />
                )}
            </section>
            {/* Plotly Chart Section */}
            <section id="plotly-chart">
                {traceConfigs.length > 0 ? (
                    <div className="plot-container">
                        <Plot
                            data={plotData}
                            layout={{
                                title: { text: customTitle },
                                xaxis: {
                                    title: { text: xAxisTitle },
                                },
                                yaxis: {
                                    title: { text: yAxisTitle },
                                },
                                bargap: layoutConfig.bargap,
                                barmode: layoutConfig.barmode
                            }}
                        />
                    </div>
                ) : (
                    <div className="no-chart-message">
                        <p>Upload a JSON file to see the chart here</p>
                    </div>
                )}
                <button onClick={handleSaveVisualization}>Save Visualization</button>
            </section>

        </div>
    );
};

export default FileUploadAndDisplay;
