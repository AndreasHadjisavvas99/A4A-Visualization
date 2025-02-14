import React, { useState, useEffect } from 'react';
import './TraceCustomization.css';

const TraceCustomization = ({
    traceConfigs,
    setTraceConfigs,
    chartTypes,       
    setChartTypes,     
    advancedMode,     
    setAdvancedMode,
    layoutConfig,
    setLayoutConfig
    
}) => {
    const defaultValues = {
        Bar: {
            opacity: 1,
            barmode: 'group',
            bargap: 0.1,
            hasText: false,
            orientation: 'v'
        },
        Line: {
            opacity: 1,
            orientation: 'v',
            mode: 'lines',
            fill: 'none'
        },
    };

    useEffect(() => {
        const updatedConfigs = traceConfigs.map((config, index) => {
            const chartTypeForTrace = chartTypes[index];
            const defaultConfig = defaultValues[chartTypeForTrace] || {};

            const preservedFields = {
                traceName: config.traceName,
                color: config.color,
                opacity: config.opacity,
            };
            const newConfig = {
                ...preservedFields, // Keep shared properties
                ...defaultConfig   // Overwrite with new defaults
            };

            if (JSON.stringify(config) !== JSON.stringify(newConfig)) {
                return newConfig;
            }

            return config;
        });

        // Only update if there's a change to avoid infinite loop
        if (JSON.stringify(traceConfigs) !== JSON.stringify(updatedConfigs)) {
            setTraceConfigs(updatedConfigs);
        }
    }, [chartTypes]); // when chartTypes change then rerun

    //handle trace specific attributes (color, opacity, hasText etc.)
    const handleChange = (index, field, value) => {
        const newTraceConfigs = [...traceConfigs];
        newTraceConfigs[index][field] = value;
        setTraceConfigs(newTraceConfigs);
    };
    //handle global attributes (barmode, bargap, etc.) only if they already exist
    const handleGlobalChange = (field, value) => {
        setTraceConfigs((prevConfigs) =>
            prevConfigs.map((config) => (
                config.hasOwnProperty(field)
                    ? { ...config, [field]: value }
                    : config
            ))
        );
        setLayoutConfig((prevLayout) => (
            prevLayout.hasOwnProperty(field)
                ? { ...prevLayout, [field]: value }
                : prevLayout
        ));
    };

    return (
        <div>
            <h4>Trace Customization</h4>
            <div className="trace-container">
                {traceConfigs.map((traceConfig, index) => {
                    const { chartType, traceName, color, opacity, barmode, bargap, hasText, orientation, mode, fill } = traceConfig;
                    return (
                        <div key={index} className="trace-card">
                            <div className="trace-header" style={{ backgroundColor: color }}>
                                <h5>Trace {index + 1}: {traceName || 'Untitled'}</h5>
                            </div>
                            <div className="trace-body">
                                {/* Trace Label */}
                                <div className="trace-input">
                                    <label>Trace Label:</label>
                                    <input
                                        type="text"
                                        value={traceName || ''}
                                        onChange={(e) => handleChange(index, 'traceName', e.target.value)}
                                    />
                                </div>

                                {/* Chart Type */}
                                <div className="trace-input">
                                    <label>Chart Type:</label>
                                    <select
                                        value={chartTypes[index]}  
                                        onChange={(e) => {
                                            const newChartTypes = [...chartTypes];
                                            newChartTypes[index] = e.target.value; 
                                            setChartTypes(newChartTypes); 
                                        }}
                                    >
                                        <option value="Line">Line</option>
                                        <option value="Bar">Bar</option>
                                        {/* Add other chart types as needed */}
                                    </select>
                                </div>

                                {/* Color and Opacity */}
                                <div className="trace-input">
                                    <label>Color:</label>
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => handleChange(index, 'color', e.target.value)}
                                    />
                                </div>
                                <div className="trace-input">
                                    <label>Opacity:</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={opacity}
                                        onChange={(e) => handleChange(index, 'opacity', e.target.value)}
                                    />
                                </div>

                                {/* Conditional Rendering Based on Chart Type */}
                                {chartTypes[index] === 'Bar' && (
                                    <div className="chart-customization">
                                        <h6>Bar Chart Customization</h6>
                                        <div className="trace-input">
                                            <label>Bar Mode</label>
                                            <select
                                                value={barmode || "group"}
                                                //onChange={(e) => handleChange(index, 'barmode', e.target.value)}
                                                onChange={(e) => handleGlobalChange('barmode', e.target.value)}
                                            >
                                                <option value="group">Group</option>
                                                <option value="stack">Stack</option>
                                                <option value="overlay">Overlay</option>
                                            </select>
                                        </div>
                                        <div className="trace-input">
                                            <label>Bar Gap</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={bargap || 0}
                                                //onChange={(e) => handleChange(index, 'bargap', parseFloat(e.target.value))}
                                                onChange={(e) => handleGlobalChange('bargap', parseFloat(e.target.value))}
                                            />
                                        </div>

                                        <div className="trace-input">
                                            <label>Show Text on Bars</label>
                                            <input 
                                                type="checkbox"
                                                checked={hasText || false}
                                                onChange={(e) => handleChange(index, 'hasText', e.target.checked)}
                                            />
                                        </div>
                                        <div className="trace-input">
                                            <label>Orientation</label>
                                            <input 
                                                type="checkbox"
                                                checked={orientation === 'h'} // Checked if orientation is 'h'
                                                onChange={(e) => handleChange(index, 'orientation', e.target.checked ? 'h' : 'v')}
                                            />
                                        </div>
                                    </div>
                                )}

                                {chartTypes[index] === 'Line' && (
                                    <div className="chart-customization">
                                        <h6>Line Chart Customization</h6>
                                        <div className="trace-input">
                                            <label>Line Mode</label>
                                            <select
                                                value={mode || "lines"}
                                                onChange={(e) => handleChange(index, 'mode', e.target.value)}
                                            >
                                                <option value="markers">Markers</option>
                                                <option value="lines">Lines</option>
                                                <option value="lines+markers">Lines + Markers</option>
                                            </select>
                                        </div>
                                        <div className="trace-input">
                                            <label>Line Fill</label>
                                            <select
                                                value={fill || "none"}
                                                onChange={(e) => handleChange(index, 'fill', e.target.value)}
                                            >
                                                <option value="none">None</option>
                                                <option value="tozeroy">To Zero Y</option>
                                                <option value="tonexty">To Next Y</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TraceCustomization;
