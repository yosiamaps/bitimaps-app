import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Territory, TerritoryStatus, Assignment, Publisher } from '../types';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { PlayCircleIcon } from '../components/icons/PlayCircleIcon';
import DashboardSkeleton from '../components/DashboardSkeleton';

type Activity = {
  type: 'completed' | 'started';
  publisherName: string;
  territoryName: string;
  date: string;
  jsDate: Date; // For sorting
};

// Donut Chart Component for Territory Status
interface DonutChartProps {
  data: { [key in TerritoryStatus]: number };
  colors: { [key in TerritoryStatus]: string };
}

const TerritoryStatusChart: React.FC<DonutChartProps> = ({ data, colors }) => {
    const total = (Object.values(data) as number[]).reduce((sum, value) => Number(sum) + Number(value), 0);
    if (total === 0) return <p className="text-zinc-500 text-center py-8">No data available</p>;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const segments = (Object.keys(data) as TerritoryStatus[]).map(key => {
        const value = data[key];
        const percentage = (Number(value) / total) * 100;
        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
        const segment = {
            key,
            value,
            strokeDasharray,
            strokeDashoffset: -accumulatedOffset,
            color: colors[key]
        };
        accumulatedOffset += (percentage / 100) * circumference;
        return segment;
    });

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="#3f3f46" strokeWidth="15" /> 
                    {segments.map(segment => (
                        <circle
                            key={segment.key}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth="15"
                            strokeDasharray={segment.strokeDasharray}
                            strokeDashoffset={segment.strokeDashoffset}
                            strokeLinecap="round"
                        >
                            <title>{`${segment.key}: ${segment.value}`}</title>
                        </circle>
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-100">{total}</span>
                    <span className="text-xs text-zinc-400">Total</span>
                </div>
            </div>
            <ul className="space-y-3 text-sm flex-grow w-full md:w-auto">
                {segments.map(segment => (
                    <li key={segment.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></span>
                            <span className="text-zinc-300">{segment.key}</span>
                        </div>
                        <span className="font-semibold text-zinc-100">{segment.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: territoriesData, error: territoriesError } = await supabase.from('territories').select('*');
      if (territoriesError) throw territoriesError;

      const { data: assignmentsData, error: assignmentsError } = await supabase.from('assignments').select('*');
      if (assignmentsError) throw assignmentsError;

      const { data: publishersData, error: publishersError } = await supabase.from('publishers').select('*');
      if (publishersError) throw publishersError;

      setTerritories(territoriesData || []);
      setAssignments(assignmentsData || []);
      setPublishers(publishersData || []);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { stats, recentActivities } = useMemo(() => {
    const statusCounts = {
      [TerritoryStatus.Completed]: 0,
      [TerritoryStatus.InProgress]: 0,
      [TerritoryStatus.Available]: 0,
    };
    const kdlDistribution: { [key: string]: number } = {};
    const activities: Activity[] = [];
    
    const territoryMap = new Map<number, Territory>(territories.map(t => [t.id, t]));
    const publisherMap = new Map<number, string>(publishers.map(p => [p.id, p.name]));

    territories.forEach(territory => {
      statusCounts[territory.status]++;
      if(territory.kdl) {
          kdlDistribution[territory.kdl] = (kdlDistribution[territory.kdl] || 0) + 1;
      }
    });

    assignments.forEach(assignment => {
        const territory = territoryMap.get(assignment.territory_id);
        const publisherName = assignment.publisher_id ? publisherMap.get(assignment.publisher_id) : 'Unknown';

        if(territory && publisherName) {
            if(assignment.completion_date) {
                activities.push({
                    type: 'completed',
                    publisherName,
                    territoryName: territory.name,
                    date: new Date(assignment.completion_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    jsDate: new Date(assignment.completion_date)
                });
            } else {
                 activities.push({
                    type: 'started',
                    publisherName,
                    territoryName: territory.name,
                    date: new Date(assignment.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    jsDate: new Date(assignment.start_date)
                });
            }
        }
    });

    const sortedActivities = activities
      .sort((a, b) => b.jsDate.getTime() - a.jsDate.getTime())
      .slice(0, 5);

    return {
      stats: { statusCounts, kdlDistribution },
      recentActivities: sortedActivities,
    };
  }, [territories, assignments, publishers]);

  const totalKdl = (Object.values(stats.kdlDistribution) as number[]).reduce((sum, count) => Number(sum) + Number(count), 0);
  const statusColors = {
      [TerritoryStatus.Completed]: '#84cc16', // lime-500
      [TerritoryStatus.InProgress]: '#f59e0b', // yellow-500
      [TerritoryStatus.Available]: '#71717a', // zinc-500
  };

  if(loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-zinc-100 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="font-semibold text-zinc-100 mb-2">Status Daerah</h2>
          <TerritoryStatusChart data={stats.statusCounts} colors={statusColors} />
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="font-semibold text-zinc-100 mb-4">Daerah KDL</h2>
          <div className="space-y-4">
            {Object.entries(stats.kdlDistribution).map(([kdl, count]) => (
              <div key={kdl}>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-medium text-zinc-300">{kdl}</span>
                  <span className="text-zinc-400">{Number(count)} Daerah</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2.5">
                  <div className="bg-lime-500 h-2.5 rounded-full" style={{ width: `${(Number(count) / (totalKdl || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="font-semibold text-zinc-100 mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-5">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div>
                  {activity.type === 'completed' ? (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-lime-500/20">
                      <CheckCircleIcon className="w-5 h-5 text-lime-400" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-500/20">
                      <PlayCircleIcon className="w-5 h-5 text-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-200 leading-snug">
                    <span className="font-semibold">{activity.publisherName}</span>
                    {activity.type === 'completed' ? ' menyelesaikan ' : ' memulai pengerjaan '}
                    <span className="font-semibold">{activity.territoryName}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
