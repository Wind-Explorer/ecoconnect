import { useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function UserCountGraph() {
  const [userInformationCollection, setUserInformationCollection] = useState<
    any[]
  >([]);
  const [chartData, setChartData] = useState<any>(null);

  const retrieveUserInformationCollection = () => {
    instance.get(`${config.serverAddress}/users/all`).then((values) => {
      setUserInformationCollection(values.data);
    });
  };

  useEffect(() => {
    retrieveUserInformationCollection();
  }, []);

  useEffect(() => {
    if (userInformationCollection.length > 0) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const daysCount = new Array(31).fill(0); // 记录过去一个月每天的用户注册数量

      userInformationCollection.forEach((user) => {
        const createdAt = new Date(user.createdAt);
        if (createdAt > lastMonth) {
          const dayIndex = Math.floor(
            (createdAt.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24)
          );
          daysCount[dayIndex]++;
        }
      });

      const labels = Array.from({ length: 31 }, (_, i) => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - (30 - i));
        return currentDate.toISOString().split("T")[0]; // 返回日期字符串 YYYY-MM-DD
      });

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "User Onboard",
            data: daysCount,
            fill: false,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
          },
        ],
      });
    }
  }, [userInformationCollection]);

  // 定义图表选项
  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(
          10,
          Math.ceil(Math.max(...(chartData?.datasets[0]?.data || [10])))
        ), // 动态设置最大值，最低为10
        ticks: {
          stepSize: 1, // 设置步长为1
        },
      },
    },
  };

  return (
    <div>
      {chartData ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
