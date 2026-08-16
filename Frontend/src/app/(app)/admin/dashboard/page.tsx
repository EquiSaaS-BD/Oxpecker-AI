export default function AdminDashboardPage() {
  return (
    <>

{/* ----Top Navigation (Shared Component)----- */}
<header className="bg-surface/80 backdrop-blur-md dark:bg-surface-dim/80 fixed top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm hidden md:block">
<div className="flex justify-between items-center h-16 px-gutter max-w-7xl mx-auto">
<div className="flex items-center gap-lg">
<div className="font-display text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight">Shustota</div>
<nav className="flex gap-md">
<a className="text-primary dark:text-primary-fixed-dim font-semibold border-b-2 border-primary pb-1 flex items-center px-sm hover:bg-primary-container/10 transition-colors duration-200" href="#">
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary flex items-center px-sm hover:bg-primary-container/10 transition-colors duration-200" href="#">
<span className="font-label-md text-label-md">Patients</span>
</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary flex items-center px-sm hover:bg-primary-container/10 transition-colors duration-200" href="#">
<span className="font-label-md text-label-md">AI Insights</span>
</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary flex items-center px-sm hover:bg-primary-container/10 transition-colors duration-200" href="#">
<span className="font-label-md text-label-md">Protocols</span>
</a>
</nav>
</div>
<div className="flex items-center gap-md">
<button className="font-label-md text-label-md text-primary hover:bg-primary-container/10 px-md py-sm rounded transition-colors duration-200">Login</button>
<button className="font-label-md text-label-md bg-primary text-on-primary px-md py-sm rounded hover:bg-primary/90 transition-colors duration-200 shadow-sm">Sign Up</button>
</div>
</div>
</header>
{/*  Main Layout  */}
<div className="flex flex-1 pt-16 md:pt-16 w-full max-w-7xl mx-auto">
{/*  Sidebar Navigation  */}
<aside className="hidden md:flex flex-col w-64 border-r border-outline-variant/30 bg-surface-container-low min-h-[calc(100vh-4rem)] pt-lg px-md gap-sm sticky top-16">
<a className="flex items-center gap-md px-md py-sm rounded-lg bg-primary-container/10 text-primary font-semibold" href="#">
<span className="material-symbols-outlined" >dashboard</span>
                Overview
            </a>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-colors" href="#">
<span className="material-symbols-outlined">event_seat</span>
                Inventory
            </a>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-colors" href="#">
<span className="material-symbols-outlined">receipt_long</span>
                Bookings
            </a>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-colors" href="#">
<span className="material-symbols-outlined">group</span>
                Staff
            </a>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-colors" href="#">
<span className="material-symbols-outlined">payment</span>
                Payments
            </a>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-colors" href="#">
<span className="material-symbols-outlined">settings</span>
                Settings
            </a>
</aside>
{/*  Main Content Area  */}
<main className="flex-1 p-gutter @container w-full overflow-hidden">
<div className="flex flex-col gap-xl">
{/*  Header Section  */}
<div className="flex justify-between items-end">
<div>
<h1 className="font-headline-lg text-headline-lg text-primary">Administration Dashboard</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage hospital resources, inventory, and operations.</p>
</div>
<div className="flex gap-sm">
<button className="bg-surface-container-high text-on-surface hover:bg-surface-variant px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs shadow-sm border border-outline-variant/30">
<span className="material-symbols-outlined text-[18px]">download</span> Export Report
                        </button>
</div>
</div>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 @4xl:grid-cols-12 gap-lg">
{/*  Quick Stats (Top Row)  */}
<div className="@4xl:col-span-12 grid grid-cols-1 @md:grid-cols-4 gap-md">
<div className="glass-card rounded-xl p-md flex flex-col gap-xs">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-on-surface-variant">Available Beds</span>
<span className="material-symbols-outlined text-secondary">bed</span>
</div>
<div className="font-headline-md text-headline-md text-on-surface">124</div>
<div className="font-body-sm text-body-sm text-tertiary flex items-center gap-xs">
<span className="material-symbols-outlined text-[16px]">arrow_upward</span> 12% from last week
                            </div>
</div>
<div className="glass-card rounded-xl p-md flex flex-col gap-xs">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-on-surface-variant">Pending Admissions</span>
<span className="material-symbols-outlined text-secondary">hourglass_empty</span>
</div>
<div className="font-headline-md text-headline-md text-on-surface">18</div>
<div className="font-body-sm text-body-sm text-error flex items-center gap-xs">
<span className="material-symbols-outlined text-[16px]">arrow_downward</span> Action required
                            </div>
</div>
<div className="glass-card rounded-xl p-md flex flex-col gap-xs">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-on-surface-variant">Active Staff</span>
<span className="material-symbols-outlined text-secondary">badge</span>
</div>
<div className="font-headline-md text-headline-md text-on-surface">342</div>
<div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
<span className="material-symbols-outlined text-[16px]">trending_up</span> +5% engagement this week
                            </div>
</div>
<div className="glass-card rounded-xl p-md flex flex-col gap-xs bg-primary-container/5 border-primary/20">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-primary">Profile Views (Weekly)</span>
<span className="material-symbols-outlined text-primary">insights</span>
</div>
<div className="font-headline-md text-headline-md text-primary">4,289</div>
<div className="h-6 mt-1 flex items-end gap-1 opacity-80">
<div className="w-1/6 bg-primary h-3 rounded-t-sm"></div>
<div className="w-1/6 bg-primary h-4 rounded-t-sm"></div>
<div className="w-1/6 bg-primary h-2 rounded-t-sm"></div>
<div className="w-1/6 bg-primary h-5 rounded-t-sm"></div>
<div className="w-1/6 bg-primary h-4 rounded-t-sm"></div>
<div className="w-1/6 bg-primary h-6 rounded-t-sm"></div>
</div>
</div>
</div>
{/*  Left Column: Inventory & Management  */}
<div className="@4xl:col-span-8 flex flex-col gap-lg">
{/*  Patient Categories Table  */}
<div className="glass-card rounded-xl p-lg flex flex-col gap-md">
<div className="flex justify-between items-center">
<h2 className="font-headline-sm text-headline-sm text-on-surface">Patient Directory</h2>
<div className="flex gap-2">
<select className="bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-sm rounded px-2 py-1">
<option>All Categories</option>
<option>Emergency</option>
<option>In-patient</option>
<option>Out-patient</option>
<option>ICU</option>
</select>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-outline-variant/50 text-on-surface-variant font-label-md text-label-md">
<th className="py-sm px-sm font-semibold">Patient Name</th>
<th className="py-sm px-sm font-semibold">Category</th>
<th className="py-sm px-sm font-semibold">Department</th>
<th className="py-sm px-sm font-semibold">Status</th>
<th className="py-sm px-sm font-semibold text-right">Action</th>
</tr>
</thead>
<tbody className="font-body-sm text-body-sm">
<tr className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
<td className="py-md px-sm">
<div className="font-semibold text-on-surface">Sarah Jenkins</div>
<div className="text-on-surface-variant text-[12px]">ID: P-98231</div>
</td>
<td className="py-md px-sm">
<span className="bg-error-container text-on-error-container px-2 py-1 rounded text-[12px] font-medium">Emergency</span>
</td>
<td className="py-md px-sm">Cardiology</td>
<td className="py-md px-sm">
<span className="bg-tertiary-container/20 text-tertiary-container px-2 py-1 rounded text-[12px] font-medium">Admitted</span>
</td>
<td className="py-md px-sm text-right">
<button className="text-primary hover:bg-primary-container/10 p-1 rounded"><span className="material-symbols-outlined text-[20px]">edit</span></button>
</td>
</tr>
<tr className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
<td className="py-md px-sm">
<div className="font-semibold text-on-surface">Michael Chang</div>
<div className="text-on-surface-variant text-[12px]">ID: P-98232</div>
</td>
<td className="py-md px-sm">
<span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[12px] font-medium">In-patient</span>
</td>
<td className="py-md px-sm">Neurology</td>
<td className="py-md px-sm">
<span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-[12px] font-medium">Pending Review</span>
</td>
<td className="py-md px-sm text-right">
<button className="text-primary hover:bg-primary-container/10 p-1 rounded"><span className="material-symbols-outlined text-[20px]">edit</span></button>
</td>
</tr>
<tr className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
<td className="py-md px-sm">
<div className="font-semibold text-on-surface">Elena Rostova</div>
<div className="text-on-surface-variant text-[12px]">ID: P-98233</div>
</td>
<td className="py-md px-sm">
<span className="bg-primary-container/20 text-primary px-2 py-1 rounded text-[12px] font-medium">Out-patient</span>
</td>
<td className="py-md px-sm">Orthopedics</td>
<td className="py-md px-sm">
<span className="bg-tertiary-container/20 text-tertiary-container px-2 py-1 rounded text-[12px] font-medium">Scheduled</span>
</td>
<td className="py-md px-sm text-right">
<button className="text-primary hover:bg-primary-container/10 p-1 rounded"><span className="material-symbols-outlined text-[20px]">edit</span></button>
</td>
</tr>
<tr className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
<td className="py-md px-sm">
<div className="font-semibold text-on-surface">David Chen</div>
<div className="text-on-surface-variant text-[12px]">ID: P-98234</div>
</td>
<td className="py-md px-sm">
<span className="bg-error text-on-error px-2 py-1 rounded text-[12px] font-medium">ICU</span>
</td>
<td className="py-md px-sm">Critical Care</td>
<td className="py-md px-sm">
<span className="bg-tertiary-container/20 text-tertiary-container px-2 py-1 rounded text-[12px] font-medium">Stable</span>
</td>
<td className="py-md px-sm text-right">
<button className="text-primary hover:bg-primary-container/10 p-1 rounded"><span className="material-symbols-outlined text-[20px]">edit</span></button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/*  Room Inventory  */}
<div className="glass-card rounded-xl p-lg flex flex-col gap-md">
<div className="flex justify-between items-center">
<h2 className="font-headline-sm text-headline-sm text-on-surface">Room Inventory</h2>
<button className="text-primary font-label-md text-label-md hover:underline">Manage All</button>
</div>
<div className="grid grid-cols-1 @md:grid-cols-2 gap-md">
{/*  Room Card 1  */}
<div className="border border-outline-variant/30 rounded-lg overflow-hidden flex flex-col bg-surface-container-lowest">
<div className="h-32 bg-surface-container-low relative">
<img className="w-full h-full object-cover" data-alt="A brightly lit, modern hospital private cabin with state-of-the-art medical equipment, a comfortable patient bed, soft blue architectural lighting, and large windows offering a city view. The room is pristine, technological, and welcoming, embodying a high-end corporate medical aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi8vjnnsDW-sPyHd3ybsfl4U6o4OVFnV6baXVh-LRxYcLO74r8yCCJgQFXXwSCa6kracYjiRMrRUdHhXyCRuqzCyLNsJ7As3bjECbu_zPFULMWIDthV5CkZHCxd3H4fSFmLZhsSflhemee_V3_fUolJ7TF4MnM9fxC3zkCOI_vbDd8EAWLkoijLuSXVhlIoNF69F_M339LKzQAEKfZ_sJmSSkramCzuhTR2h9dY5YSp4ihuerLhULXPdOWqBSSJB5DybfUnVjapW1e"/>
<div className="absolute top-2 right-2 bg-tertiary text-on-tertiary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Available</div>
</div>
<div className="p-md flex flex-col gap-xs">
<h3 className="font-headline-sm text-headline-sm">Deluxe Cabin</h3>
<div className="flex justify-between items-center mt-xs">
<span className="font-mono text-mono text-on-surface-variant">$250 / night</span>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" value=""/>
<div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
{/*  Room Card 2  */}
<div className="border border-outline-variant/30 rounded-lg overflow-hidden flex flex-col bg-surface-container-lowest">
<div className="h-32 bg-surface-container-low relative">
<img className="w-full h-full object-cover" data-alt="A clean, highly organized intensive care unit (ICU) room in a modern hospital. Advanced robotic medical arms and monitoring screens surround the bed. The lighting is cool, clinical blue and bright white, conveying precision, sterility, and advanced healthcare technology." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPeDgkNts7k_c8t2WLLHHHIjvj4SwBQ9puzv3yCz3DislpvnjxEqRiwFKW7llHaeULmso2EC7O_A3K1rizBNwVP7WqT89NT-TlBc1gjS2u8nxD720czF6WwOmnuK3FS9sbrB1S3kUu2Cw94wMFfyMgYav1OVn7-s6kbnzjAifEXr5jnE3J-VVFw31QFN_ECQNoScYUaSLTvb237lktr4Qjsq17NevuxPAXtC_zt5hKr-GhamVj63Vg1KDCfleMzWVoFUwGYEMNoW3p"/>
<div className="absolute top-2 right-2 bg-error text-on-error px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Occupied</div>
</div>
<div className="p-md flex flex-col gap-xs">
<h3 className="font-headline-sm text-headline-sm">ICU Suite A</h3>
<div className="flex justify-between items-center mt-xs">
<span className="font-mono text-mono text-on-surface-variant">$800 / night</span>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" value=""/>
<div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
</div>
</div>
</div>
{/*  Right Column: Settings & Gallery  */}
<div className="@4xl:col-span-4 flex flex-col gap-lg">
{/*  Payment Management  */}
<div className="glass-card rounded-xl p-lg flex flex-col gap-md">
<div className="flex justify-between items-center">
<h2 className="font-headline-sm text-headline-sm text-on-surface">Payment Management</h2>
<button className="text-primary hover:bg-primary-container/10 p-1 rounded transition-colors"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
</div>
<div className="flex gap-2 mb-2">
<button className="flex-1 bg-surface-container-high hover:bg-surface-variant text-on-surface py-1 rounded text-[12px] font-semibold border border-outline-variant/30">Methods</button>
<button className="flex-1 bg-transparent hover:bg-surface-variant text-on-surface-variant py-1 rounded text-[12px] font-semibold border border-transparent">Transactions</button>
</div>
<div className="flex flex-col gap-sm">
<div className="flex justify-between items-center p-sm border border-outline-variant/30 rounded bg-surface-container-lowest">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary">account_balance_wallet</span>
<span className="font-body-sm text-body-sm font-semibold">bKash</span>
</div>
<span className="text-[12px] text-tertiary font-semibold bg-tertiary-container/20 px-2 py-1 rounded">Active</span>
</div>
<div className="flex justify-between items-center p-sm border border-outline-variant/30 rounded bg-surface-container-lowest">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">payments</span>
<span className="font-body-sm text-body-sm font-semibold">Nagad</span>
</div>
<span className="text-[12px] text-tertiary font-semibold bg-tertiary-container/20 px-2 py-1 rounded">Active</span>
</div>
<div className="flex justify-between items-center p-sm border border-outline-variant/30 rounded bg-surface-container-lowest">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
<span className="font-body-sm text-body-sm font-semibold">Visa / Mastercard</span>
</div>
<span className="text-[12px] text-tertiary font-semibold bg-tertiary-container/20 px-2 py-1 rounded">Active</span>
</div>
</div>
</div>
{/*  Service Pricing Quick Edit  */}
<div className="glass-card rounded-xl p-lg flex flex-col gap-md">
<h2 className="font-headline-sm text-headline-sm text-on-surface">Service Pricing</h2>
<div className="flex flex-col gap-sm">
<div className="flex justify-between items-center p-sm hover:bg-surface-container-low rounded transition-colors">
<span className="font-body-sm text-body-sm">Standard Consultation</span>
<span className="font-mono text-mono font-semibold">$150</span>
</div>
<div className="flex justify-between items-center p-sm hover:bg-surface-container-low rounded transition-colors">
<span className="font-body-sm text-body-sm">MRI Scan (Head)</span>
<span className="font-mono text-mono font-semibold">$850</span>
</div>
<div className="flex justify-between items-center p-sm hover:bg-surface-container-low rounded transition-colors">
<span className="font-body-sm text-body-sm">Complete Blood Count</span>
<span className="font-mono text-mono font-semibold">$45</span>
</div>
</div>
<button className="mt-sm w-full py-2 border border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary-container/10 transition-colors">Update Price List</button>
</div>
{/*  Facility Gallery Management  */}
<div className="glass-card rounded-xl p-lg flex flex-col gap-md">
<div className="flex justify-between items-center">
<h2 className="font-headline-sm text-headline-sm text-on-surface">Facility Gallery</h2>
<button className="text-primary p-1 hover:bg-primary-container/10 rounded-full transition-colors"><span className="material-symbols-outlined text-[20px]">add_a_photo</span></button>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Manage images for patient portal.</p>
<div className="grid grid-cols-2 gap-sm">
<div className="aspect-square rounded-lg bg-surface-container-low border border-outline-variant/30 overflow-hidden relative group">
<img className="w-full h-full object-cover" data-alt="A wide angle shot of a modern hospital reception area. The space is vast, featuring sleek curved glass walls, pristine white floors, and soft, indirect blue lighting. A futuristic information desk stands in the center. The mood is calm, professional, and technologically advanced." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3riODe836dXpC23ZDw0icqvdadEW80sVH6qZKY0B1b4LS8VHOffRupiDeXfFyEr6neW8yulhJWr7b-VVAJstG4wwM7K3Oc2OIEp4fmpX288PqdaWDrUGb3FmxaJld8sUEezr9k_Eb6wolRXbky58f-_3KiCFZNwAY1nC_SwSawmq9vhumDVubY11WcE9NpXLVvFnTtpqD29Z75uIoudS80c9cXPvNqPVi9wNs8pwj0vtQQtjQLDIRSfTrCU78v2mkc-6IoNwr_iwL"/>
<div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-white">delete</span>
</div>
</div>
<div className="aspect-square rounded-lg bg-surface-container-low border border-outline-variant/30 overflow-hidden relative group">
<img className="w-full h-full object-cover" data-alt="A bright, state-of-the-art MRI scanning room. The large, modern MRI machine is the focal point, illuminated by calming, soft blue ambient light against crisp white walls. The environment feels sterile, safe, and highly clinical." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkwgI_hdSI3jl5yyRWsSajuV4hBRy800hNsugS3hiYHVsnAVocsp1U7SAp1b4vtIK8UjD4NAf-JXmskVEK2zc0HHDi1NqGHPt8xSzkbesO0yLIk71rYm-1T1q9PUrgLO8CsEesKUJ9Ht7SCdIVvghPsQB5Ai6paVknGHj1yTx-NQrG4Fu1CZSDEUm8EncDxWcw0MiGaV3eB1-Vd4eprsfletL6g3nvKw2TweA_EwCK0ucG3R1SLl8if663zIgI7CrWTQwVZCXKnhTH"/>
<div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-white">delete</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
{/*  Footer (Shared Component)  */}
<footer className="bg-surface-container-low dark:bg-surface-container-lowest w-full mt-auto border-t border-outline-variant/20 py-xl px-gutter">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
<div className="font-display text-headline-sm font-semibold text-primary">Shustota</div>
<div className="text-secondary dark:text-secondary-fixed-dim font-body-sm text-body-sm">
                © 2024 Shustota AI Healthcare. For professional use only.
            </div>
<div className="flex gap-md font-body-sm text-body-sm">
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-100 hover:opacity-80" href="#">Medical Disclaimer</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-100 hover:opacity-80" href="#">Privacy Policy</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-100 hover:opacity-80" href="#">Terms of Service</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-100 hover:opacity-80" href="#">Regulatory Compliance</a>
</div>
</div>
</footer>

    </>
  );
}
