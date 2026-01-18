# USER DASHBOARD - NEW FEATURES UI SECTIONS

Add these sections to UserDashboard.jsx after importing the modals:

## 1. Import Modals (Add at top after other imports)
```javascript
import { BottleReturnModal, ScheduleOrderModal, ComplaintModal } from '../components/UserModals';
```

## 2. Add Modals in JSX (Before closing </div> of main container)
```javascript
{/* Modals */}
<BottleReturnModal 
    show={showReturnModal}
    onClose={() => setShowReturnModal(false)}
    onSubmit={handleBottleReturn}
    orders={orders}
/>

<ScheduleOrderModal
    show={showScheduleModal}
    onClose={() => setShowScheduleModal(false)}
    onSubmit={handleScheduleOrder}
    vendors={vendors}
/>

<ComplaintModal
    show={showComplaintModal}
    onClose={() => setShowComplaintModal(false)}
    onSubmit={handleSubmitComplaint}
    vendors={vendors}
    orders={orders}
/>
```

## 3. Add Quick Action Buttons (After referral banner, before grid)
```javascript
<div className="flex gap-3 flex-wrap">
    <button 
        onClick={() => setShowScheduleModal(true)}
        className="glass px-4 py-3 rounded-xl flex items-center gap-2 text-sky-400 hover:bg-sky-500/10 transition-all"
    >
        <CalendarPlus size={18} />
        <span className="text-sm font-bold">Schedule Order</span>
    </button>
    
    <button 
        onClick={() => setShowReturnModal(true)}
        className="glass px-4 py-3 rounded-xl flex items-center gap-2 text-emerald-400 hover:bg-emerald-500/10 transition-all"
    >
        <Recycle size={18} />
        <span className="text-sm font-bold">Return Bottles</span>
    </button>
    
    <button 
        onClick={() => setShowComplaintModal(true)}
        className="glass px-4 py-3 rounded-xl flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-all"
    >
        <MessageSquare size={18} />
        <span className="text-sm font-bold">Report Issue</span>
    </button>
</div>
```

## 4. Add Tab Content Sections (In the right panel where other tabs are)

### Scheduled Orders Tab
```javascript
{activeTab === 'scheduled' && (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Scheduled Orders</h2>
            <button 
                onClick={() => setShowScheduleModal(true)}
                className="btn-primary px-4 py-2 rounded-lg text-sm"
            >
                + New Schedule
            </button>
        </div>
        
        {scheduledOrders.length === 0 ? (
            <div className="glass-card text-center py-20">
                <CalendarPlus size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No scheduled orders yet</p>
            </div>
        ) : (
            scheduledOrders.map(schedule => (
                <div key={schedule._id} className="glass-card border-sky-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {schedule.quantity} Bottles
                            </h3>
                            <p className="text-sm text-slate-400">
                                {schedule.vendor?.vendorName}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs text-sky-400 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(schedule.scheduledDate).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {schedule.timeSlot}
                                </span>
                            </div>
                            {schedule.recurring && (
                                <span className="inline-block mt-2 px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-md font-bold">
                                    🔁 {schedule.frequency}
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                schedule.status === 'Scheduled' ? 'bg-sky-500/10 text-sky-400' :
                                schedule.status === 'Executed' ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-slate-500/10 text-slate-400'
                            }`}>
                                {schedule.status}
                            </span>
                            {schedule.status === 'Scheduled' && (
                                <button
                                    onClick={() => handleCancelScheduled(schedule._id)}
                                    className="mt-2 text-xs text-rose-400 hover:text-rose-300"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
)}
```

### Bottle Returns Tab
```javascript
{activeTab === 'returns' && (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Bottle Returns</h2>
            <button 
                onClick={() => setShowReturnModal(true)}
                className="btn-primary px-4 py-2 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-600"
            >
                + Request Return
            </button>
        </div>
        
        {bottleReturns.length === 0 ? (
            <div className="glass-card text-center py-20">
                <Recycle size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No bottle returns yet</p>
            </div>
        ) : (
            bottleReturns.map(ret => (
                <div key={ret._id} className="glass-card border-emerald-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {ret.quantityReturned} Bottles Returned
                            </h3>
                            <p className="text-sm text-slate-400">
                                {ret.vendor?.vendorName}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                {new Date(ret.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-emerald-400">
                                +₹{ret.depositRefund}
                            </p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                                ret.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                                ret.status === 'Collected' ? 'bg-sky-500/10 text-sky-400' :
                                'bg-emerald-500/10 text-emerald-400'
                            }`}>
                                {ret.status}
                            </span>
                        </div>
                    </div>
                    {ret.notes && (
                        <p className="mt-3 text-xs text-slate-400 italic">
                            Note: {ret.notes}
                        </p>
                    )}
                </div>
            ))
        )}
    </div>
)}
```

### Complaints Tab
```javascript
{activeTab === 'complaints' && (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">My Complaints</h2>
            <button 
                onClick={() => setShowComplaintModal(true)}
                className="btn-primary px-4 py-2 rounded-lg text-sm bg-rose-500 hover:bg-rose-600"
            >
                + New Complaint
            </button>
        </div>
        
        {complaints.length === 0 ? (
            <div className="glass-card text-center py-20">
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No complaints submitted</p>
            </div>
        ) : (
            complaints.map(complaint => (
                <div key={complaint._id} className="glass-card border-rose-500/20">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-xs rounded-md font-bold">
                                {complaint.category}
                            </span>
                            <p className="text-sm text-slate-400 mt-2">
                                {complaint.vendor?.vendorName}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            complaint.status === 'Open' ? 'bg-amber-500/10 text-amber-400' :
                            complaint.status === 'In Progress' ? 'bg-sky-500/10 text-sky-400' :
                            'bg-emerald-500/10 text-emerald-400'
                        }`}>
                            {complaint.status}
                        </span>
                    </div>
                    <p className="text-white text-sm mb-2">{complaint.message}</p>
                    {complaint.resolution && (
                        <div className="mt-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                            <p className="text-xs font-bold text-emerald-400 mb-1">Resolution:</p>
                            <p className="text-xs text-slate-300">{complaint.resolution}</p>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 mt-3">
                        Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                </div>
            ))
        )}
    </div>
)}
```

### Analytics Tab
```javascript
{activeTab === 'analytics' && analytics && (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-sky-400" size={28} />
            Usage Analytics
        </h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
            <div className="glass-card border-sky-500/20">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total Bottles</p>
                <p className="text-3xl font-black text-white">{analytics.totalLifetimeBottles}</p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
            </div>
            
            <div className="glass-card border-emerald-500/20">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total Spent</p>
                <p className="text-3xl font-black text-white">₹{analytics.totalLifetimeSpent}</p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
            </div>
            
            <div className="glass-card border-amber-500/20">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Monthly Avg</p>
                <p className="text-3xl font-black text-white">{analytics.averageMonthlyConsumption.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">Bottles/month</p>
            </div>
            
            <div className="glass-card border-purple-500/20">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">vs Society</p>
                <p className={`text-3xl font-black ${analytics.comparisonPercentage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {analytics.comparisonPercentage > 0 ? '+' : ''}{analytics.comparisonPercentage}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Comparison</p>
            </div>
        </div>
        
        {/* Monthly Breakdown */}
        <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-4">Monthly Breakdown</h3>
            <div className="space-y-3">
                {analytics.monthlyUsage.slice(-6).reverse().map((month, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                            <p className="text-white font-bold">{month.month}</p>
                            <p className="text-xs text-slate-400">{month.orderCount} orders</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold">{month.totalBottles} bottles</p>
                            <p className="text-xs text-slate-400">₹{month.totalSpent}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)}
```

These sections should be added in the right panel section where other tab contents (orders, subscriptions, wallet) are displayed.
