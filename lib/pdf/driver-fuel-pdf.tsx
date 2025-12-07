import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  getFuelSourceLabel
} from "./pdf-utils";
import type { DriverFuelHistory } from "../types/fuel";

interface DriverFuelPDFProps {
  fuelHistory: DriverFuelHistory;
  dateRange: { from: string; to: string };
  driverName?: string;
}

export function DriverFuelPDF({
  fuelHistory,
  dateRange,
  driverName,
}: DriverFuelPDFProps) {
  const { driverId, records, anomaliesDetected, anomalyRecords } = fuelHistory;

  // Calculate summary statistics
  const totalFuel = records.reduce((sum, record) => sum + record.liters, 0);
  const totalDistance = records.reduce(
    (sum, record) => sum + (record.distanceKm || 0),
    0
  );
  const avgEfficiency = totalDistance > 0 ? totalFuel / totalDistance : 0;

  // Calculate excess fuel loss
  const excessFuel =
    anomalyRecords?.reduce((sum, anomaly) => {
      const record = records.find((r) => r.id === anomaly.recordId);
      if (record && record.estimatedFuelL) {
        const loss = record.liters - record.estimatedFuelL;
        return sum + (loss > 0 ? loss : 0);
      }
      return sum;
    }, 0) || 0;

  // Get unique vehicles
  const uniqueVehicles = Array.from(
    new Set(records.map((r) => r.vehicle?.plate).filter(Boolean))
  ).length;

  // Split records into pages (18 records per page - fewer because we have more columns)
  const recordsPerPage = 18;
  const totalPages = Math.ceil(records.length / recordsPerPage);

  return (
    <Document>
      {Array.from({ length: Math.max(1, totalPages) }).map((_, pageIndex) => {
        const startIndex = pageIndex * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, records.length);
        const pageRecords = records.slice(startIndex, endIndex);

        return (
          <Page key={pageIndex} style={pdfStyles.page}>
            {/* Header - Only on first page */}
            {pageIndex === 0 && (
              <>
                <View>
                  <Text style={pdfStyles.header}>DRIVER FUEL REPORT</Text>
                  <Text style={pdfStyles.text}>
                    Driver: {driverName || driverId}
                  </Text>
                  <Text style={pdfStyles.text}>
                    Date Range: {formatDate(dateRange.from)} -{" "}
                    {formatDate(dateRange.to)}
                  </Text>
                  <Text style={pdfStyles.textSmall}>
                    Generated: {formatDateTime(new Date())}
                  </Text>
                </View>

                {/* Anomaly Alert */}
                {anomaliesDetected > 0 && (
                  <>
                    <View style={pdfStyles.divider} />
                    <View style={pdfStyles.anomalyAlert}>
                      <Text style={pdfStyles.anomalyAlertText}>
                        ⚠ ANOMALIES DETECTED: {anomaliesDetected}
                      </Text>
                      <Text style={pdfStyles.textSmall}>
                        Excess Consumption: {formatNumber(excessFuel, 1)} L
                        {excessFuel > 0 &&
                          totalFuel > 0 &&
                          ` (+${formatNumber(
                            (excessFuel / totalFuel) * 100,
                            1
                          )}%)`}
                      </Text>
                    </View>
                  </>
                )}

                <View style={pdfStyles.divider} />
              </>
            )}

            {/* Fuel Records Table */}
            <View>
              {pageIndex === 0 && (
                <Text style={pdfStyles.subheader}>FUEL RECORDS</Text>
              )}

              <View style={pdfStyles.table}>
                {/* Table Header */}
                <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                  <Text style={[pdfStyles.tableCellSmall, { width: "12%" }]}>
                    Date
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "18%" }]}>
                    Vehicle
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "10%" }]}>
                    Liters
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "10%" }]}>
                    Distance
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "10%" }]}>
                    L/km
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "15%" }]}>
                    Route
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "10%" }]}>
                    Odometer
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "9%" }]}>
                    Source
                  </Text>
                  <Text style={[pdfStyles.tableCellSmall, { width: "6%" }]}>
                    Anom.
                  </Text>
                </View>

                {/* Table Rows */}
                {pageRecords.map((record, index) => {
                  const isAnomaly = anomalyRecords?.some(
                    (a) => a.recordId === record.id
                  );
                  const anomalyDetail = anomalyRecords?.find(
                    (a) => a.recordId === record.id
                  );

                  return (
                    <View key={record.id || index} style={pdfStyles.tableRow}>
                      <Text
                        style={[pdfStyles.tableCellSmall, { width: "12%" }]}
                      >
                        {formatDate(record.recordedAt)}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCellSmall, { width: "18%" }]}
                      >
                        {record.vehicleId ? `${record.vehicleId}` : "N/A"}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCellSmall, { width: "10%" }]}
                      >
                        {formatNumber(record.liters, 1)} L
                      </Text>
                      <Text
                        style={[pdfStyles.tableCellSmall, { width: "10%" }]}
                      >
                        {record.distanceKm
                          ? `${formatNumber(record.distanceKm, 1)}`
                          : "N/A"}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCellSmall, { width: "10%" }]}
                      >
                        {record.fuelType ? `${record.fuelType}` : "N/A"}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCellSmall, { width: "15%" }]}
                      >
                        {record.routeCode || "N/A"}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCellSmall, { width: "10%" }]}
                      >
                        {record.machineryType ? record.machineryType : "N/A"}
                      </Text>
                      <Text style={[pdfStyles.tableCellSmall, { width: "9%" }]}>
                        {getFuelSourceLabel(record.source)}
                      </Text>
                      <Text style={[pdfStyles.tableCellSmall, { width: "6%" }]}>
                        {isAnomaly && anomalyDetail
                          ? `+${formatNumber(anomalyDetail.deltaPercent, 0)}%`
                          : "-"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Summary - Only on last page */}
            {pageIndex === totalPages - 1 && (
              <>
                <View style={pdfStyles.divider} />
                <View>
                  <Text style={pdfStyles.subheader}>SUMMARY</Text>
                  <View style={pdfStyles.metricGrid}>
                    <View style={pdfStyles.metricGridItem}>
                      <Text style={pdfStyles.metricTitle}>Total Records</Text>
                      <Text style={pdfStyles.metricValue}>
                        {records.length}
                      </Text>
                    </View>
                    <View style={pdfStyles.metricGridItem}>
                      <Text style={pdfStyles.metricTitle}>Vehicles Used</Text>
                      <Text style={pdfStyles.metricValue}>
                        {uniqueVehicles}
                      </Text>
                    </View>
                    <View style={pdfStyles.metricGridItem}>
                      <Text style={pdfStyles.metricTitle}>Total Fuel</Text>
                      <Text style={pdfStyles.metricValue}>
                        {formatNumber(totalFuel, 1)} L
                      </Text>
                    </View>
                    <View style={pdfStyles.metricGridItem}>
                      <Text style={pdfStyles.metricTitle}>Total Distance</Text>
                      <Text style={pdfStyles.metricValue}>
                        {formatNumber(totalDistance, 1)} km
                      </Text>
                    </View>
                    <View style={pdfStyles.metricGridItem}>
                      <Text style={pdfStyles.metricTitle}>Avg Efficiency</Text>
                      <Text style={pdfStyles.metricValue}>
                        {formatNumber(avgEfficiency, 2)} L/km
                      </Text>
                    </View>
                    <View style={pdfStyles.metricGridItem}>
                      <Text style={pdfStyles.metricTitle}>Anomalies</Text>
                      <Text style={pdfStyles.metricValue}>
                        {anomaliesDetected}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Footer */}
            <View style={pdfStyles.footer} fixed>
              <Text>
                Gas System - Driver Fuel Report ({driverName || driverId}) |
                Page {pageIndex + 1} of {totalPages}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
