import { Territory, Publisher, TerritoryStatus } from '../types';

export const territories: Territory[] = [
  {
    id: 101,
    name: "Daerah A-01",
    kdl: "Wangurer",
    // Fix: Corrected property name from 'gmapsLink' to 'gmaps_link' and removed 'history' to match the Territory type.
    gmaps_link: "https://maps.google.com",
    status: TerritoryStatus.Completed,
  },
  {
    id: 102,
    name: "Daerah A-02",
    kdl: "Wangurer",
    // Fix: Corrected property name from 'gmapsLink' to 'gmaps_link' and removed 'currentAssignment' and 'history' to match the Territory type.
    gmaps_link: "https://maps.google.com",
    status: TerritoryStatus.InProgress,
  },
  // Fix: Removed 'history' property to match the Territory type.
  {
    id: 103,
    name: "Daerah B-01",
    kdl: "Madidir",
    status: TerritoryStatus.Available,
  },
  // Fix: Removed 'history' property to match the Territory type.
  {
    id: 104,
    name: "Daerah B-02",
    kdl: "Madidir",
    status: TerritoryStatus.Available,
  },
  {
    id: 105,
    name: "Daerah C-01",
    kdl: "Bitung",
    // Fix: Corrected property name from 'gmapsLink' to 'gmaps_link' and removed 'currentAssignment' and 'history' to match the Territory type.
    gmaps_link: "https://maps.google.com",
    status: TerritoryStatus.InProgress,
  },
  // Fix: Removed 'history' property to match the Territory type.
  {
    id: 106,
    name: "Daerah D-01",
    kdl: "Bitung",
    status: TerritoryStatus.Completed,
  },
  // Fix: Removed 'history' property to match the Territory type.
   {
    id: 107,
    name: "Daerah E-01",
    kdl: "Wangurer",
    status: TerritoryStatus.Available,
  },
];

export const publishers: Publisher[] = [
  // Fix: Removed 'assignedTerritoryId' property to match the Publisher type.
  {
    id: 1,
    name: "Budi Santoso",
    group: "A",
  },
  // Fix: Removed 'assignedTerritoryId' property to match the Publisher type.
  {
    id: 2,
    name: "Citra Lestari",
    group: "A",
  },
  // Fix: Removed 'assignedTerritoryId' property to match the Publisher type.
  {
    id: 3,
    name: "David Maulana",
    group: "B",
  },
  // Fix: Removed 'assignedTerritoryId' property to match the Publisher type.
  {
    id: 4,
    name: "Eka Wijaya",
    group: "B",
  },
  // Fix: Removed 'assignedTerritoryId' property to match the Publisher type.
  {
    id: 5,
    name: "Fitri Handayani",
    group: "C",
  },
  // Fix: Removed 'assignedTerritoryId' property to match the Publisher type.
  {
    id: 6,
    name: "Gita Permata",
    group: "C",
  },
];