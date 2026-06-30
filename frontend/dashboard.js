document.addEventListener('DOMContentLoaded', () => {
    let chartInstance = null;

    const fetchData = async () => {
        try {
            const response = await fetch('/results');
            const data = await response.json();
            
            if (data && data.length > 0) {
                updateKPIs(data[data.length - 1]);
                renderChart(data);
            }
        } catch (error) {
            console.error("Error fetching results:", error);
            document.getElementById('statusMessage').innerText = "Failed to load data.";
        }
    };

    const updateKPIs = (latestData) => {
        document.getElementById('kpi-download').innerText = latestData.download ? latestData.download.toFixed(1) : '--';
        document.getElementById('kpi-upload').innerText = latestData.upload ? latestData.upload.toFixed(1) : '--';
        document.getElementById('kpi-ping').innerText = latestData.ping ? latestData.ping.toFixed(0) : '--';
        document.getElementById('kpi-jitter').innerText = latestData.jitter ? latestData.jitter.toFixed(1) : '--';
    };

    const renderChart = (data) => {
        const ctx = document.getElementById('downloadChart').getContext('2d');
        
        const labels = data.map(d => {
            const date = new Date(d.timestamp);
            return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        });
        
        const downloads = data.map(d => d.download);
        const uploads = data.map(d => d.upload);

        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const textColor = isDarkMode ? '#FAFAFA' : '#18181B';
        const gridColor = isDarkMode ? 'rgba(63,63,70,0.5)' : 'rgba(226,232,240,0.5)';
        const primaryColor = '#2563EB'; // Electric Blue
        const secondaryColor = '#10B981'; // Emerald

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Download (Mbps)',
                        data: downloads,
                        borderColor: primaryColor,
                        backgroundColor: primaryColor + '10',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointBackgroundColor: primaryColor
                    },
                    {
                        label: 'Upload (Mbps)',
                        data: uploads,
                        borderColor: secondaryColor,
                        backgroundColor: secondaryColor + '10',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointBackgroundColor: secondaryColor
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            color: textColor,
                            font: {
                                family: "'Satoshi', sans-serif",
                                size: 12,
                                weight: 500
                            },
                            boxWidth: 12,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? '#18181B' : '#FFFFFF',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        titleFont: {
                            family: "'JetBrains Mono', monospace",
                            size: 11
                        },
                        bodyFont: {
                            family: "'JetBrains Mono', monospace",
                            size: 12
                        },
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: isDarkMode ? '#A1A1AA' : '#71717A',
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 10
                            },
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor,
                            drawBorder: false,
                            borderDash: [4, 4]
                        },
                        beginAtZero: true,
                        ticks: {
                            color: isDarkMode ? '#A1A1AA' : '#71717A',
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 10
                            },
                            padding: 10
                        }
                    }
                }
            }
        });
    };

    const runSpeedtestBtn = document.getElementById('runSpeedtestBtn');
    const statusMessage = document.getElementById('statusMessage');

    runSpeedtestBtn.addEventListener('click', async () => {
        runSpeedtestBtn.disabled = true;
        runSpeedtestBtn.innerHTML = `<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Running...`;
        statusMessage.innerText = "Speedtest running. This may take up to 30 seconds.";
        
        try {
            const response = await fetch('/speedtest/run', { method: 'POST' });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Server error");
            }
            
            await fetchData();
            statusMessage.innerText = "Completed successfully.";
            setTimeout(() => { statusMessage.innerText = ""; }, 3000);
            
        } catch (error) {
            console.error("Error triggering speedtest:", error);
            statusMessage.innerText = error.message;
        } finally {
            resetButton();
        }
    });

    const resetButton = () => {
        runSpeedtestBtn.disabled = false;
        runSpeedtestBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.94 5.94"/></svg> Run Speedtest`;
    };

    // Initial fetch
    fetchData();
});
