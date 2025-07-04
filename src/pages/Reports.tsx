
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { getMedicalReports } from '@/lib/api';
import { MedicalReport } from '@/lib/api';
import SpinnerLoader from '@/components/SpinnerLoader';
import MedicalReportItem from '@/components/MedicalReportItem';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const loadReports = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const reportData = await getMedicalReports(user.id);
        setReports(reportData);
      } catch (error) {
        console.error('Error loading medical reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [user]);

  const getFilteredAndSortedReports = () => {
    let filteredReports = [...reports];

    // Apply type filter
    if (filter !== 'all') {
      filteredReports = filteredReports.filter(
        report => report.reportType.toLowerCase() === filter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredReports = filteredReports.filter(
        report =>
          report.title.toLowerCase().includes(query) ||
          report.doctor.toLowerCase().includes(query) ||
          report.hospital.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'date-desc':
        return filteredReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-asc':
        return filteredReports.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'title-asc':
        return filteredReports.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return filteredReports.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return filteredReports;
    }
  };

  // Get unique report types from all reports
  const reportTypes = ['all', ...new Set(reports.map(report => report.reportType.toLowerCase()))];

  const filteredReports = getFilteredAndSortedReports();

  if (loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex h-[80vh] items-center justify-center">
          <SpinnerLoader size="lg" text="Loading your medical reports..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <main className="container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1>Medical Reports</h1>
            <p className="text-muted-foreground">
              Manage and view all your medical documents
            </p>
          </div>
          <Link to="/reports/new">
            <Button className="health-gradient">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Filters and search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report listing */}
        {filteredReports.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <MedicalReportItem key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            {reports.length === 0 ? (
              <>
                <h2 className="text-xl font-medium mb-2">No Medical Reports Yet</h2>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Start building your medical history by uploading your first report.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-medium mb-2">No Matching Reports</h2>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </>
            )}
            <Link to="/reports/new">
              <Button className="health-gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add Medical Report
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
