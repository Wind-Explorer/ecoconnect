import { useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function UserTownCouncilDistributionChart() {
  const [userInformationCollection, setUserInformationCollection] = useState<
    any[]
  >([]);
  const [townCouncilInformation, setTownCouncilInformation] = useState<
    string[]
  >([]);
  const [chartData, setChartData] = useState<any>(null);

  const retrieveInformation = () => {
    instance.get(`${config.serverAddress}/users/all`).then((values) => {
      setUserInformationCollection(values.data);
    });
    instance
      .get(`${config.serverAddress}/users/town-councils-metadata`)
      .then((values) => {
        setTownCouncilInformation(JSON.parse(values.data).townCouncils);
      });
  };

  const generateChartData = () => {
    const townCouncilCounts: { [key: string]: number } = {};
    userInformationCollection.forEach((user: any) => {
      const townCouncil = user.townCouncil || "Unknown";
      if (townCouncilCounts[townCouncil]) {
        townCouncilCounts[townCouncil]++;
      } else {
        townCouncilCounts[townCouncil] = 1;
      }
    });

    const labels = Object.keys(townCouncilCounts);
    const data = Object.values(townCouncilCounts);

    const chartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map(
            (label, index) => `hsl(${index * (360 / labels.length)}, 70%, 50%)`
          ),
        },
      ],
    };

    setChartData(chartData);
  };

  useEffect(() => {
    retrieveInformation();
  }, []);

  useEffect(() => {
    if (
      userInformationCollection.length > 0 &&
      townCouncilInformation.length > 0
    ) {
      generateChartData();
    }
  }, [userInformationCollection, townCouncilInformation]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "left" as const,
        labels: {
          font: {
            size: 20,
          },
          color: "black",
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const dataset = tooltipItem.dataset;
            const dataIndex = tooltipItem.dataIndex;
            const value = dataset.data[dataIndex];
            return `${chartData.labels[dataIndex]}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div>
      {chartData ? (
        <Pie data={chartData} options={options} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
