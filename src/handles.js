export const handleXAxisTitleChange = (setXAxisTitle) => (e) => {
    setXAxisTitle(e.target.value);
};

export const handleYAxisTitleChange = (setYAxisTitle) => (e) => {
    setYAxisTitle(e.target.value);
};

export const handleZAxisTitleChange = (setZAxisTitle) => (e) => {
    setZAxisTitle(e.target.value);
};

export const handleTitleChange = (setCustomTitle) => (e) => {
    setCustomTitle(e.target.value);
};

export const handleGlobalChartTypeChange = (setChartTypes, setTraceConfigs, setChartType) => (e) => {
    const newChartType = e.target.value;

    setChartTypes((prevChartTypes) => Array(prevChartTypes.length).fill(newChartType));

    setTraceConfigs((prevTraceConfigs) =>
        prevTraceConfigs.map((trace) => {
            if (newChartType === "Pie") {
                const { color, ...rest } = trace;
                return rest;
            }
            return trace;
        })
    );

    setChartType(newChartType);
};

export const handleAdvancedCustomizationToggle = (setAdvancedMode, setTraceConfigs) => () => {
    setAdvancedMode((prevMode) => {
        const newMode = !prevMode;

        if (newMode) {
            setTraceConfigs((prevTraces) =>
                prevTraces.map(trace => ({
                    ...trace,
                    mode: trace.mode || "lines",
                    fill: trace.fill || "none",
                    barmode: trace.barmode || "group",
                    bargap: trace.bargap ?? 0.1,  
                }))
            );
        }
        return newMode;
    });
};
