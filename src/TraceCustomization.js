import React, { useState, useEffect } from 'react';
import { COLOR_PALETTES } from './utils';
import './TraceCustomization.css';
import { saveTraceToDB, updateTraceInDB, deleteTraceFromDB} from './SaveVisualization';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchLayoutsByType } from './SaveVisualization';
import { Accordion,AccordionSummary, AccordionDetails, Card, CardContent, Typography, TextField, Select, MenuItem, FormControl,
    InputLabel, Slider, Switch, Grid, Button, Stack} from "@mui/material";

const TraceCustomization = ({
    traceConfigs,
    setTraceConfigs,
    chartTypes,       
    setChartTypes,   
    layoutConfig,  
    setLayoutConfig
    
}) => {
    const [savedTraces, setSavedTraces] = useState([]);
    const [selectedTrace, setSelectedTrace] = useState("");

    const chartAttributesMap = {
        Bar: new Set(['bookmrk','opacity', 'barmode', 'bargap', 'hasText', 'orientation']),
        Line: new Set(['bookmrk','opacity', 'orientation', 'mode', 'fill']),
        Pie: new Set(['bookmrk','opacity', 'palette', 'hole']),
        scatterpolar: new Set(['bookmrk','opacity', 'fill']), // Radar
        Box: new Set(['bookmrk','opacity', 'orientation', 'boxpoints', 'jitter', 'boxmean']),
        Violin: new Set(['bookmrk','opacity', 'meanline', 'box']),
        Histogram: new Set(['bookmrk','opacity', 'barmode', 'bargap', 'orientation']),
        Heatmap: new Set(['bookmrk','opacity'])
    };

    const handleSaveTrace = async (config, chartType, index) => {
        if (config.bookmark === 1) {
            console.log("ℹ️ Trace already saved.");
            return;
        }
        const newTrace = {
            
            ...config,
            id: undefined,   
            bookmark: true,   
            templateName: config.templateName || "Unnamed Template",
        };
        const result = await saveTraceToDB(newTrace, chartType);
        await fetchAndSetTraces();
    };
      
    const handleUpdateTrace = async (config, chartType, index) => {    
        const selectedTraceId = selectedTrace;
        const result = await updateTraceInDB(selectedTraceId, config, chartType);
        await fetchAndSetTraces();
    };

    const handleDeleteTrace = async (config, chartType, index) => {
        const success = await deleteTraceFromDB(selectedTrace, chartType);
        if (success) {
            handleChange(index, "id", undefined);
            handleChange(index, "bookmark", false);
            await fetchAndSetTraces();
        }
        setSelectedTrace("none");
    };
      
    const handleLoadSavedTrace = (selectedTraceId, traceIndex) => {
        if (selectedTraceId === "none") {
            console.log("🛑 No trace selected. Resetting configuration.");
            return;
        }
    
        let selectedTraceConfig = null;
    
        // 🔍 Find the selected trace in savedTraces
        Object.values(savedTraces).forEach((traces) => {
            const foundTrace = traces.find((trace) => trace.id === selectedTraceId);
            if (foundTrace) {
                selectedTraceConfig = foundTrace;
            }
        });
    
        if (!selectedTraceConfig) {
            console.error("❌ Selected trace not found.");
            return;
        }
    
        console.log(`✅ Applying Trace Config to Index ${traceIndex}:`, selectedTraceConfig);
    
        // Apply new config but preserve the old ID/bookmark
        setTraceConfigs((prevConfigs) =>
            prevConfigs.map((config, index) => {
                if (index === traceIndex) {
                    return {
                        ...config,                         // keep existing ID and bookmark
                        ...selectedTraceConfig,            // override everything else
                        id: config.id,                     // force keep Layout A reference
                        bookmark: config.bookmark || false,
                    };
                }
                return config;
            })
        );
    };
    
    
    
    useEffect(() => {
        const updatedConfigs = traceConfigs.map((config, index) => {
            const chartTypeForTrace = chartTypes[index];
            const allowedAttributes = chartAttributesMap[chartTypeForTrace] || new Set();

            // Preserve only the valid attributes for the selected chart type
            const filteredConfig = Object.keys(config)
                .filter(key => allowedAttributes.has(key) || key === 'traceName' || key === 'color' || key === 'bookmark' || key === 'id')
                .reduce((acc, key) => {
                    acc[key] = config[key];
                    return acc;
                }, {});

            if (JSON.stringify(config) !== JSON.stringify(filteredConfig)) {
                return filteredConfig;
            }
            return config;
        });

        // Only update if there's a change to avoid infinite loop
        if (JSON.stringify(traceConfigs) !== JSON.stringify(updatedConfigs)) {
            setTraceConfigs(updatedConfigs);
        }
    }, [chartTypes]);


    const fetchAndSetTraces = async () => {
        const newSavedTraces = {};
        for (const chartType of new Set(chartTypes)) {
            const traces = await fetchLayoutsByType(chartType); // ✅ Fetch traces
            newSavedTraces[chartType] = traces.filter(trace => trace.bookmark === true); // ✅ Store traces
        }
        setSavedTraces(newSavedTraces);
    };

    useEffect(() => {
        fetchAndSetTraces();
    }, [chartTypes]);
    
    

    //handle trace specific attributes (color, opacity, hasText etc.)
    const handleChange = (index, field, value) => {
        setTraceConfigs((prevConfigs) =>
          prevConfigs.map((trace, i) => {
            if (i !== index) return trace;
      
            return {
                ...trace,
                [field]: value,
                bookmark: field === "bookmark" ? value : trace.bookmark, // ✅ only change if field is 'bookmark'
                id: field === "id" ? value : trace.id, // ✅ preserve ID unless being set
                };
            })
        );
    };
      
    //handle global attributes (barmode, bargap, etc.) only if they already exist
    const handleGlobalChange = (field, value) => {
        traceConfigs.forEach((_, index) => {
            handleChange(index, field, value);
        });
    
        setLayoutConfig((prevLayout) => ({
            ...prevLayout,
            [field]: value
        }));
    };
    
    return (
        <div>     
            {traceConfigs.map((traceConfig, index) => {
                const { chartType, traceName, bookmark, color, palette, opacity, barmode, bargap, hasText, orientation, mode, fill, boxpoints, boxmean, jitter, meanline, box, hole } = traceConfig;
                return (
                    <Accordion key={index} sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 'none' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f9f9f9' }}>
                            <Typography variant="h6">
                                Trace {index + 1}: {traceConfig.traceName || "Untitled"}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Card sx={{ boxShadow: 'none', borderRadius: 2, border: '1px solid #eee' }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        {/* Trace Label*/}
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                    fullWidth
                                                    label="Trace Label"
                                                    variant="outlined"
                                                    value={traceConfig.traceName || ""}
                                                    onChange={(e) =>
                                                        handleChange(index, "traceName", e.target.value)
                                                    }
                                                />
                                        </Grid>

                                        {/* Chart Type*/}
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                            <InputLabel>Chart Type</InputLabel>
                                                <Select
                                                    value={chartTypes[index]}
                                                    onChange={(e) => {
                                                        const newChartTypes = [...chartTypes];
                                                        newChartTypes[index] = e.target.value;
                                                        setChartTypes(newChartTypes);
                                                    }}
                                                >
                                                    <MenuItem value="Line">Line</MenuItem>
                                                    <MenuItem value="Bar">Bar</MenuItem>
                                                    <MenuItem value="Pie">Pie</MenuItem>
                                                    <MenuItem value="ScatterPolar">Radar</MenuItem>
                                                    <MenuItem value="Violin">Violin</MenuItem>
                                                    <MenuItem value="Box">Box</MenuItem>
                                                    <MenuItem value="Histogram">Histogram</MenuItem>
                                                    <MenuItem value="Heatmap">Heatmap</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Color Picker */}
                                        {chartTypes[index] !== "Pie" && (
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel shrink>Color</InputLabel>
                                                    <input
                                                        type="color"
                                                        value={traceConfig.color}
                                                        onChange={(e) =>
                                                            handleChange(index, "color", e.target.value)
                                                        }
                                                        style={{
                                                            width: "30%",
                                                            height: "40px",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                </FormControl>
                                            </Grid>
                                        )}

                                        {/* Opacity */}
                                        <Grid item xs={12} sm={6}>
                                            <Typography>Opacity</Typography>
                                                <Slider
                                                    value={traceConfig.opacity || 1}
                                                    min={0}
                                                    max={1}
                                                    step={0.01}
                                                    onChange={(e, newValue) =>
                                                        handleChange(index, "opacity", newValue)
                                                    }
                                                />
                                        </Grid>

                                        {/* Conditional Settings for Bar Chart */}
                                        {chartTypes[index] === "Bar" && (
                                            <>
                                                {/* Bar Mode Dropdown */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Bar Mode</InputLabel>
                                                        <Select
                                                            value={layoutConfig.barmode || "group"}  // ✅ Use layoutConfig
                                                            onChange={(e) => handleGlobalChange("barmode", e.target.value)}
                                                        >
                                                            <MenuItem value="group">Group</MenuItem>
                                                            <MenuItem value="stack">Stack</MenuItem>
                                                            <MenuItem value="overlay">Overlay</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                {/* Bar Gap Slider */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Bar Gap</Typography>
                                                    <Slider
                                                        value={layoutConfig.bargap || 0}  // ✅ Use layoutConfig
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        onChange={(e, newValue) => handleGlobalChange("bargap", newValue)}
                                                    />
                                                </Grid>

                                                {/* Show Text on Bars Toggle */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Show Text on Bars</Typography>
                                                    <Switch
                                                        checked={traceConfig.hasText || false}
                                                        onChange={(e) => handleChange(index, "hasText", e.target.checked)}
                                                    />
                                                </Grid>

                                                {/* Bar Orientation Toggle */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Orientation</Typography>
                                                    <Switch
                                                        checked={traceConfig.orientation === "h"}
                                                        onChange={(e) => {
                                                            const newOrientation = e.target.checked ? "h" : "v";
                                                            handleGlobalChange("orientation", newOrientation);
                                                        }}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        {chartTypes[index] === "Line" && (
                                            <>
                                                {/* Line Mode Dropdown */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Line Mode</InputLabel>
                                                        <Select
                                                            value={traceConfig.mode || "lines+markers"}
                                                            onChange={(e) => handleChange(index, "mode", e.target.value)}
                                                        >
                                                            <MenuItem value="markers">Markers</MenuItem>
                                                            <MenuItem value="lines">Lines</MenuItem>
                                                            <MenuItem value="lines+markers">Lines + Markers</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                {/* Line Fill Dropdown */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Line Fill</InputLabel>
                                                        <Select
                                                            value={traceConfig.fill || "none"}
                                                            onChange={(e) => handleChange(index, "fill", e.target.value)}
                                                        >
                                                            <MenuItem value="none">None</MenuItem>
                                                            <MenuItem value="tozeroy">To Zero Y</MenuItem>
                                                            <MenuItem value="tonexty">To Next Y</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </>
                                        )}
                                        {chartTypes[index] === "Pie" && (
                                            <>
                                                {/* 🎨 Color Palette Selector for Pie Charts */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Select Color Palette</InputLabel>
                                                        <Select
                                                            value={traceConfig.palette || ""}
                                                            onChange={(e) => {
                                                                const selectedPalette = e.target.value;
                                                                handleChange(index, "palette", selectedPalette);
                                                            }}
                                                            fullWidth
                                                        >
                                                            {/* Default Custom Option */}
                                                            <MenuItem value="">
                                                                <em>🎨 Custom (Manual Selection)</em>
                                                            </MenuItem>

                                                            {/* Dynamically Generate Menu Items from COLOR_PALETTES */}
                                                            {Object.keys(COLOR_PALETTES).map((paletteKey) => (
                                                                <MenuItem key={paletteKey} value={paletteKey}>
                                                                    {paletteKey.charAt(0).toUpperCase() + paletteKey.slice(1)}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                {/* Pie hole */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Hole</Typography>
                                                        <Slider
                                                            value={traceConfig.hole || 1}
                                                            min={0}
                                                            max={1}
                                                            step={0.01}
                                                            onChange={(e, newValue) =>
                                                                handleChange(index, "hole", newValue)
                                                            }
                                                        />
                                                </Grid>
                                            </>
                                        )}
                                        {chartTypes[index] === "ScatterPolar" && (
                                            <>
                                                {/* Radar Fill Dropdown */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Radar Fill</InputLabel>
                                                        <Select
                                                            value={traceConfig.fill || "none"}
                                                            onChange={(e) => handleChange(index, "fill", e.target.value)}
                                                        >
                                                            <MenuItem value="none">None</MenuItem>
                                                            <MenuItem value="toself">To Self</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </>
                                        )}
                                        {chartTypes[index] === "Box" && (
                                            <>
                                                {/* Orientation Toggle */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Orientation</Typography>
                                                    <Switch
                                                        checked={traceConfig.orientation === "h"}
                                                        onChange={(e) =>
                                                            handleGlobalChange("orientation", e.target.checked ? "h" : "v")
                                                        }
                                                    />
                                                </Grid>

                                                {/* Box Points Dropdown */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Box Points</InputLabel>
                                                        <Select
                                                            value={traceConfig.boxpoints || "none"}
                                                            onChange={(e) => handleChange(index, "boxpoints", e.target.value)}
                                                        >
                                                            <MenuItem value="none">None</MenuItem>
                                                            <MenuItem value="all">All</MenuItem>
                                                            <MenuItem value="outliers">Outliers</MenuItem>
                                                            <MenuItem value="suspectedoutliers">Suspected Outliers</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                {/* Jitter Slider (Global Setting) */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Jitter</Typography>
                                                    <Slider
                                                        value={traceConfig.jitter || 0}
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        onChange={(e, newValue) => handleGlobalChange("jitter", newValue)}
                                                    />
                                                </Grid>

                                                {/* Box Mean Toggle */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Box Mean</Typography>
                                                    <Switch
                                                        checked={traceConfig.boxmean || false}
                                                        onChange={(e) => handleChange(index, "boxmean", e.target.checked)}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        {chartTypes[index] === "Violin" && (
                                            <>
                                                {/* Add Meanline Toggle */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Add Meanline</Typography>
                                                    <Switch
                                                        checked={traceConfig.meanline || false}
                                                        onChange={(e) => handleChange(index, "meanline", e.target.checked)}
                                                    />
                                                </Grid>

                                                {/* Add Box Toggle */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Add Box</Typography>
                                                    <Switch
                                                        checked={traceConfig.box || false}
                                                        onChange={(e) => handleChange(index, "box", e.target.checked)}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        {chartTypes[index] === "Histogram" && (
                                            <>
                                                {/* Bar Mode Dropdown (Global Setting) */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Bar Mode</InputLabel>
                                                        <Select
                                                            value={traceConfig.barmode || "group"}
                                                            onChange={(e) => handleGlobalChange("barmode", e.target.value)}
                                                        >
                                                            <MenuItem value="group">Group</MenuItem>
                                                            <MenuItem value="stack">Stack</MenuItem>
                                                            <MenuItem value="overlay">Overlay</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                {/* Bar Gap Slider (Global Setting) */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Bar Gap</Typography>
                                                    <Slider
                                                        value={traceConfig.bargap || 0}
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        onChange={(e, newValue) => handleGlobalChange("bargap", newValue)}
                                                    />
                                                </Grid>

                                                {/* Orientation Toggle (Global Setting) */}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography>Orientation</Typography>
                                                    <Switch
                                                        checked={traceConfig.orientation === "h"}
                                                        onChange={(e) => handleGlobalChange("orientation", e.target.checked ? "h" : "v")}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        
                                        <Grid item xs={12}>
                                            <Stack direction="row" spacing={2} justifyContent="flex-start">
                                                {/* Save Button */}
                                                <Button
                                                    variant={traceConfig.bookmark ? "contained" : "outlined"}
                                                    color="primary"
                                                    onClick={() => handleSaveTrace(traceConfig, chartTypes[index], index)}
                                                    size="small"
                                                    >
                                                    Save
                                                </Button>
                                                {/* Update Button */}
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => handleUpdateTrace(traceConfig, chartTypes[index], index)}
                                                    disabled={selectedTrace === "none" || !selectedTrace}
                                                    size="small"
                                                    >
                                                    Update
                                                </Button>

                                                {/* Delete Button */}
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteTrace(traceConfig, chartTypes[index], index)}
                                                    disabled={selectedTrace === "none" || !selectedTrace}
                                                    size="small"
                                                    >
                                                    Delete
                                                </Button>
                                                <TextField
                                                    fullWidth
                                                    label="Template Name"
                                                    variant="outlined"
                                                    value={traceConfig.templateName || ""}
                                                    onChange={(e) => handleChange(index, "templateName", e.target.value)}
                                                />
                                            </Stack>
                                        </Grid>

                                        {/* 🔻 Load Saved Trace Dropdown */}
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Select Saved Trace</InputLabel>
                                                <Select
                                                    value={selectedTrace}
                                                    onChange={(e) => {
                                                        setSelectedTrace(e.target.value);
                                                        handleLoadSavedTrace(e.target.value, index);
                                                    }}
                                                >
                                                    {/* ✅ Default "None" option */}
                                                    <MenuItem value="none">
                                                        <em>None</em>
                                                    </MenuItem>

                                                    {/* ✅ Loop through saved traces */}
                                                    {Object.entries(savedTraces).map(([chartType, traces]) =>
                                                        traces.map((trace) => (
                                                            <MenuItem key={trace.id} value={trace.id}>
                                                                {trace.templateName || trace.id}
                                                            </MenuItem>
                                                        ))
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </div>
    );
};

export default TraceCustomization;