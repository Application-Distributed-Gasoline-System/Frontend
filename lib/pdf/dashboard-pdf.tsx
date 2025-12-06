import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";
import { formatDate, formatDateTime, formatNumber } from "./pdf-utils";
import type { FuelReportItem } from "../types/fuel";

interface DashboardPDFProps {
  fuelReport: FuelReportItem[];
  dateRange: { from: string; to: string };
  metrics: {
    totalFuelConsumed: number;
    avgConsumption: number;
    totalAnomalies: number;
    potentialFuelLoss: number;
    anomalyRate: number;
    fleetAvailability: number;
  };
}

export function DashboardPDF({
  fuelReport,
  dateRange,
  metrics,
}: DashboardPDFProps) {
  // Get top 5 consumers
  const topConsumers = fuelReport
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, 5);

  // Get vehicles with anomalies
  const vehiclesWithAnomalies = fuelReport
    .filter((item) => item.anomaliesDetected > 0)
    .sort((a, b) => b.anomaliesDetected - a.anomaliesDetected)
    .slice(0, 10);

  return (
    <Document>
      <Page style={pdfStyles.page}>
        {/* Header */}
        <View>
          <Text style={pdfStyles.header}>FUEL ANALYTICS REPORT</Text>
          <Text style={pdfStyles.text}>
            Date Range: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </Text>
          <Text style={pdfStyles.textSmall}>
            Generated: {formatDateTime(new Date())}
          </Text>
        </View>

        <View style={pdfStyles.divider} />

        {/* Key Metrics */}
        <View>
          <Text style={pdfStyles.subheader}>KEY METRICS</Text>
          <View style={pdfStyles.metricGrid}>
            <View style={pdfStyles.metricGridItem}>
              <Text style={pdfStyles.metricTitle}>Total Fuel Consumed</Text>
              <Text style={pdfStyles.metricValue}>
                {formatNumber(metrics.totalFuelConsumed, 2)} L
              </Text>
            </View>
            <View style={pdfStyles.metricGridItem}>
              <Text style={pdfStyles.metricTitle}>Avg Consumption</Text>
              <Text style={pdfStyles.metricValue}>
                {formatNumber(metrics.avgConsumption, 2)} L/km
              </Text>
            </View>
            <View style={pdfStyles.metricGridItem}>
              <Text style={pdfStyles.metricTitle}>Anomalies Detected</Text>
              <Text style={pdfStyles.metricValue}>{metrics.totalAnomalies}</Text>
            </View>
            <View style={pdfStyles.metricGridItem}>
              <Text style={pdfStyles.metricTitle}>Potential Fuel Loss</Text>
              <Text style={pdfStyles.metricValue}>
                {formatNumber(metrics.potentialFuelLoss, 1)} L
              </Text>
            </View>
            <View style={pdfStyles.metricGridItem}>
              <Text style={pdfStyles.metricTitle}>Fleet Availability</Text>
              <Text style={pdfStyles.metricValue}>
                {formatNumber(metrics.fleetAvailability, 1)}%
              </Text>
            </View>
            <View style={pdfStyles.metricGridItem}>
              <Text style={pdfStyles.metricTitle}>Anomaly Rate</Text>
              <Text style={pdfStyles.metricValue}>
                {formatNumber(metrics.anomalyRate, 1)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.divider} />

        {/* Top Consuming Vehicles */}
        <View>
          <Text style={pdfStyles.subheader}>TOP CONSUMING VEHICLES</Text>
          <View style={pdfStyles.table}>
            {/* Table Header */}
            <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
              <Text style={[pdfStyles.tableCell, { width: "20%" }]}>Plate</Text>
              <Text style={[pdfStyles.tableCell, { width: "25%" }]}>Vehicle</Text>
              <Text style={[pdfStyles.tableCell, { width: "20%" }]}>Total Fuel</Text>
              <Text style={[pdfStyles.tableCell, { width: "20%" }]}>Avg L/km</Text>
              <Text style={[pdfStyles.tableCell, { width: "15%" }]}>Anomalies</Text>
            </View>

            {/* Table Rows */}
            {topConsumers.map((vehicle, index) => (
              <View key={index} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { width: "20%" }]}>
                  {vehicle.vehicle.plate}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: "25%" }]}>
                  {vehicle.vehicle.brand} {vehicle.vehicle.model}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: "20%" }]}>
                  {formatNumber(vehicle.totalLiters, 1)} L
                </Text>
                <Text style={[pdfStyles.tableCell, { width: "20%" }]}>
                  {formatNumber(vehicle.avgLitersPerKm, 2)}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: "15%" }]}>
                  {vehicle.anomaliesDetected}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Anomaly Summary */}
        {vehiclesWithAnomalies.length > 0 && (
          <>
            <View style={pdfStyles.divider} />
            <View>
              <Text style={pdfStyles.subheader}>ANOMALY SUMMARY</Text>
              <View style={pdfStyles.anomalyAlert}>
                <Text style={pdfStyles.anomalyAlertText}>
                  ⚠ {vehiclesWithAnomalies.length} vehicles with anomalies detected
                </Text>
              </View>

              <View style={pdfStyles.table}>
                {/* Table Header */}
                <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                  <Text style={[pdfStyles.tableCell, { width: "20%" }]}>Plate</Text>
                  <Text style={[pdfStyles.tableCell, { width: "30%" }]}>Vehicle</Text>
                  <Text style={[pdfStyles.tableCell, { width: "20%" }]}>Anomalies</Text>
                  <Text style={[pdfStyles.tableCell, { width: "30%" }]}>Max Deviation</Text>
                </View>

                {/* Table Rows */}
                {vehiclesWithAnomalies.slice(0, 8).map((vehicle, index) => {
                  const maxDeviation = vehicle.anomalyRecords?.reduce(
                    (max, record) => Math.max(max, record.deltaPercent),
                    0
                  ) || 0;

                  return (
                    <View key={index} style={pdfStyles.tableRow}>
                      <Text style={[pdfStyles.tableCell, { width: "20%" }]}>
                        {vehicle.vehicle.plate}
                      </Text>
                      <Text style={[pdfStyles.tableCell, { width: "30%" }]}>
                        {vehicle.vehicle.brand} {vehicle.vehicle.model}
                      </Text>
                      <Text style={[pdfStyles.tableCell, { width: "20%" }]}>
                        {vehicle.anomaliesDetected}
                      </Text>
                      <Text style={[pdfStyles.tableCell, { width: "30%" }]}>
                        +{formatNumber(maxDeviation, 1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={pdfStyles.footer} fixed>
          <Text>
            Gas System - Fuel Analytics Report | Page 1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  );
}
