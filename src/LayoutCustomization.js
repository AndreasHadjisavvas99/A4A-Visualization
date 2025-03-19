import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Slider, Switch, Typography, Grid } from "@mui/material";


export const BarChartCustomization = ({ traceConfig, handleChange }) => {
    return (
        <div>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Bar Chart Customization
            </Typography>

            <Grid container spacing={2}>
                {/* Bar Mode */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Bar Mode</InputLabel>
                        <Select
                            value={traceConfig.barmode || "group"}
                            onChange={(e) => handleChange("barmode", e.target.value)}
                        >
                            <MenuItem value="group">Group</MenuItem>
                            <MenuItem value="stack">Stack</MenuItem>
                            <MenuItem value="overlay">Overlay</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Bar Gap */}
                <Grid item xs={12} sm={6}>
                    <Typography>Bar Gap</Typography>
                    <Slider
                        value={traceConfig.bargap || 0}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(e, newValue) => handleChange("bargap", newValue)}
                    />
                </Grid>

                {/* Show Text on Bars */}
                <Grid item xs={12} sm={6}>
                    <Typography>Show Text on Bars</Typography>
                    <Switch
                        checked={traceConfig.hasText || false}
                        onChange={(e) => handleChange("hasText", e.target.checked)}
                    />
                </Grid>

                {/* Bar Orientation */}
                <Grid item xs={12} sm={6}>
                    <Typography>Orientation</Typography>
                    <Switch
                        checked={traceConfig.orientation === "h"}
                        onChange={(e) =>
                            handleChange("orientation", e.target.checked ? "h" : "v")
                        }
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export const LineChartCustomization = ({ traceConfig, handleChange }) => {
    return (
        <div>
            <Typography variant="h6">Line Chart Customization</Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Line Mode</InputLabel>
                <Select
                    value={traceConfig.mode || "lines"}
                    onChange={(e) => handleChange("mode", e.target.value)}
                >
                    <MenuItem value="markers">Markers</MenuItem>
                    <MenuItem value="lines">Lines</MenuItem>
                    <MenuItem value="lines+markers">Lines + Markers</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Line Fill</InputLabel>
                <Select
                    value={traceConfig.fill || "none"}
                    onChange={(e) => handleChange("fill", e.target.value)}
                >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="tozeroy">To Zero Y</MenuItem>
                    <MenuItem value="tonexty">To Next Y</MenuItem>
                </Select>
            </FormControl>
        </div>
    );
};