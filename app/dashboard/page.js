'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { parseCSV } from '@/lib/csvParser';
import { analyzeWaste, generateInsights } from '@/lib/recurringDetection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  AlertTriangle,
  LogOut,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  Filter,
  Moon,
  Sun
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { useTheme } from 'next-themes';

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [wasteAnalysis, setWasteAnalysis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      return;
    }
    
    setUser(session.user);
    await fetchData(session.user.id);
  };

  const fetchData = async (userId) => {
    setLoading(true);
    try {
      // Fetch transactions
      const transRes = await fetch(`/api?action=transactions&userId=${userId}`);
      const transData = await transRes.json();
      setTransactions(transData.transactions || []);

      // Fetch subscriptions
      const subsRes = await fetch(`/api?action=subscriptions&userId=${userId}`);
      const subsData = await subsRes.json();
      setSubscriptions(subsData.subscriptions || []);

      // Fetch stats
      const statsRes = await fetch(`/api?action=stats&userId=${userId}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // Generate waste analysis
      if (transData.transactions?.length > 0) {
        const waste = analyzeWaste(transData.transactions, subsData.subscriptions || []);
        setWasteAnalysis(waste);

        const insightsData = generateInsights(transData.transactions, subsData.subscriptions || []);
        setInsights(insightsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCsvFile(file);
      const parsed = await parseCSV(file);
      setParsedPreview(parsed.slice(0, 10)); // Show first 10
      
      toast({
        title: 'File parsed successfully',
        description: `Found ${parsed.length} transactions. Review and upload.`,
      });
    } catch (error) {
      console.error('Parse error:', error);
      toast({
        title: 'Error parsing CSV',
        description: 'Please check your file format',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async () => {
    if (!csvFile || !user) return;

    setUploading(true);
    try {
      const parsed = await parseCSV(csvFile);

      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          userId: user.id,
          transactions: parsed
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Upload successful! 🎉',
          description: `Uploaded ${data.inserted} transactions. Detected ${data.subscriptionsDetected} subscriptions.`,
        });

        setCsvFile(null);
        setParsedPreview([]);
        await fetchData(user.id);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
    setUploading(false);
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteAll',
          userId: user.id
        })
      });

      if (response.ok) {
        toast({
          title: 'Data deleted',
          description: 'All your data has been removed.',
        });
        await fetchData(user.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete data',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Description', 'Amount', 'Category'],
      ...transactions.map(t => [t.date, t.description, t.amount, t.category])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  // Prepare chart data
  const getSpendingOverTime = () => {
    if (transactions.length === 0) return [];

    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate >= startOfMonth(month) && tDate <= endOfMonth(month);
      });

      const total = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      return {
        month: format(month, 'MMM yyyy'),
        spending: Math.round(total)
      };
    });
  };

  const getCategoryData = () => {
    if (!stats.categoryTotals) return [];
    
    return Object.entries(stats.categoryTotals).map(([category, amount]) => ({
      name: category,
      value: Math.round(amount)
    }));
  };

  const filteredTransactions = filterCategory === 'all' 
    ? transactions 
    : transactions.filter(t => t.category === filterCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shadow Spending Detector</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalSpending?.toFixed(0) || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.transactionCount || 0} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.subscriptionCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{stats.monthlySubscriptions?.toFixed(0) || 0}/month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{((stats.monthlySubscriptions || 0) * 12).toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{wasteAnalysis?.totalWaste?.toFixed(0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monthly savings opportunity
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Smart Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        insight.type === 'alert'
                          ? 'bg-red-500/10 border border-red-500/20'
                          : insight.type === 'warning'
                          ? 'bg-orange-500/10 border border-orange-500/20'
                          : 'bg-blue-500/10 border border-blue-500/20'
                      }`}
                    >
                      <p className="text-sm">{insight.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getSpendingOverTime()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="spending" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Waste Analysis */}
            {wasteAnalysis && wasteAnalysis.totalWaste > 0 && (
              <Card className="border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-orange-600">💰 Money Wasted</CardTitle>
                  <CardDescription>Areas where you could save money</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wasteAnalysis.lowValuePayments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Low-Value Repeated Payments</h4>
                      {wasteAnalysis.lowValuePayments.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2">
                          <span>{item.name}</span>
                          <Badge variant="destructive">
                            {item.count}x = ₹{item.totalAmount.toFixed(0)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {wasteAnalysis.duplicateSubscriptions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Potential Duplicate Subscriptions</h4>
                      {wasteAnalysis.duplicateSubscriptions.map((item, idx) => (
                        <div key={idx} className="py-2">
                          <p className="text-sm">
                            {item.sub1} ↔ {item.sub2}
                          </p>
                          <Badge variant="outline">Could save ₹{item.wastage.toFixed(0)}/month</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Bank Statement</CardTitle>
                <CardDescription>
                  Upload your CSV bank statement to detect recurring payments and subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    CSV file with Date, Description, and Amount columns
                  </p>
                </div>

                {parsedPreview.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Preview (first 10 transactions)</h3>
                      <Button onClick={handleUpload} disabled={uploading}>
                        {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Upload All Transactions
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Description</th>
                            <th className="text-right p-2">Amount</th>
                            <th className="text-left p-2">Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedPreview.map((t, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-2">{t.date}</td>
                              <td className="p-2">{t.description}</td>
                              <td className="p-2 text-right">₹{t.amount}</td>
                              <td className="p-2">
                                <Badge variant="outline">{t.category}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>{filteredTransactions.length} transactions</CardDescription>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.keys(stats.categoryTotals || {}).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {filteredTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{t.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{t.date}</p>
                            <Badge variant="outline" className="ml-2">{t.category}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{parseFloat(t.amount).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Detected Subscriptions</CardTitle>
                <CardDescription>
                  Recurring payments detected from your transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No subscriptions detected yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload more transactions to detect recurring patterns
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((sub) => (
                      <Card key={sub.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{sub.name}</h3>
                              <Badge className="mt-2">{sub.frequency}</Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-purple-600">
                                ₹{parseFloat(sub.amount).toFixed(0)}
                              </p>
                              <p className="text-sm text-muted-foreground">per month</p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Yearly Cost</p>
                              <p className="font-semibold">
                                ₹{(parseFloat(sub.amount) * 12).toFixed(0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Detected</p>
                              <p className="font-semibold">{sub.last_detected}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>Download your transactions as CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleExport} disabled={transactions.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Transactions
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleDeleteAll}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
