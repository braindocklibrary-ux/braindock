import React, { useState } from 'react';
import { 
  Zap, 
  Sun, 
  Sparkles, 
  Check, 
  X, 
  Coffee, 
  DoorOpen, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  BookOpen, 
  ShieldCheck, 
  User, 
  Armchair,
  Lock,
  Compass
} from 'lucide-react';

export default function Interactive3DSeatMap({ 
  seats = [], 
  selectedSeat = null, 
  onSelectSeat = () => {},
  onConfirmBooking = null
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Quick lookup helper for live seat status
  const getSeatData = (seatNum) => {
    const found = seats.find(s => Number(s.seatNumber) === Number(seatNum));
    if (found) return found;
    return {
      seatNumber: seatNum,
      status: 'Available',
      zone: 'Silent AC Reading Sanctuary',
      floor: 'Main Floor'
    };
  };

  // Seat number groupings exactly matching user sketch (media_1791203680244.jpg)
  const topWallLeft = [9, 8, 7, 6, 5]; // Desks 9 to 5
  const topWallRight = [4, 3, 2, 1];   // Desks 4 to 1 (starts next to Cupboard)
  
  const leftWallCol1 = [10, 11, 12, 13, 14]; // Desk 10 is on left wall directly adjacent to 11
  const leftWallCol2 = [35, 36, 37];
  const leftWallCol3 = [60, 61, 62, 63];
  const leftWallCol4 = [87, 88, 89];

  // Island 1 (Desks 15 to 34)
  const island1RowA = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const island1RowB = [34, 33, 32, 31, 30, 29, 28, 27, 26, 25];

  // Island 2 (Desks 38 to 59)
  const island2RowA = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
  const island2RowB = [59, 58, 57, 56, 55, 54, 53, 52, 51, 50];

  // Island 3 (Desks 64 to 86)
  const island3RowA = [64, 65, 66, 67, 68, 69, 70, 71, 72, 73];
  const island3RowB = [86, 85, 84, 83, 82, 81, 80, 79, 78, 77];

  // Bottom Row (Desks 90 to 99)
  const bottomRow = [90, 91, 92, 93, 94, 95, 96, 97, 98, 99];

  // Right Wall seats
  const rightWallCol1 = [48, 49];
  const rightWallCol2 = [74, 75, 76];
  const rightWallCol3 = [100, 101, 102];

  // Live count summary
  const totalCount = 102;
  const availableCount = seats.filter(s => s.status === 'Available').length || 88;
  const bookedCount = totalCount - availableCount;

  // ==========================================================
  // 3D THEATER RECLINER SEAT
  // - Available: Royal Purple / Violet (Previously selected color)
  // - Selected: Vibrant Golden Amber (Standout, NOT green)
  // - Booked: Sleek Slate Gray
  // ==========================================================
  const render3DReclinerSeat = (seatNum) => {
    const seatObj = getSeatData(seatNum);
    const isSelected = selectedSeat && Number(selectedSeat.seatNumber) === Number(seatNum);
    const isAvailable = seatObj.status === 'Available';
    const isOccupied = seatObj.status === 'Occupied' || seatObj.status === 'Expired';
    const isReserved = seatObj.status === 'Reserved';

    let backrestFill = '';
    let cushionFill = '';
    let armrestFill = '';
    let strokeColor = '';
    let textColor = '#FFFFFF';
    let filterStyle = '';
    let wrapperClasses = '';

    if (isSelected) {
      // ⭐ SELECTED DESK: Vibrant Golden Amber (Standout highlight, NOT green!)
      backrestFill = 'url(#gradSelectedGoldBack)';
      cushionFill = 'url(#gradSelectedGoldCushion)';
      armrestFill = '#B45309';
      strokeColor = '#FDE047';
      textColor = '#FFFFFF';
      filterStyle = 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.75))';
      wrapperClasses = 'scale-110 z-30 animate-pulse';
    } else if (isAvailable) {
      // 🟣 AVAILABLE DESKS: Royal Purple / Violet (User requested: green replaced with purple!)
      backrestFill = 'url(#gradAvailPurpleBack)';
      cushionFill = 'url(#gradAvailPurpleCushion)';
      armrestFill = '#581C87';
      strokeColor = '#C084FC';
      textColor = '#FFFFFF';
      filterStyle = 'drop-shadow(0 2px 5px rgba(147, 51, 234, 0.35))';
      wrapperClasses = 'hover:scale-110 hover:-translate-y-1 transition-all duration-200 cursor-pointer';
    } else if (isOccupied) {
      // ⚪ BOOKED / OCCUPIED DESKS: Sleek Theater Slate Gray
      backrestFill = 'url(#gradOccBackLight)';
      cushionFill = '#E2E8F0';
      armrestFill = '#94A3B8';
      strokeColor = '#CBD5E1';
      textColor = '#64748B';
      wrapperClasses = 'cursor-not-allowed opacity-60';
    } else if (isReserved) {
      // 🟠 RESERVED DESKS
      backrestFill = 'url(#gradResBack)';
      cushionFill = '#F59E0B';
      armrestFill = '#B45309';
      strokeColor = '#FCD34D';
      textColor = '#FFFFFF';
      wrapperClasses = 'cursor-not-allowed opacity-80';
    }

    return (
      <div 
        key={seatNum}
        className={`relative group flex items-center justify-center p-0.5 select-none ${wrapperClasses}`}
        onMouseEnter={() => setHoveredSeat(seatObj)}
        onMouseLeave={() => setHoveredSeat(null)}
      >
        <button
          type="button"
          disabled={!isAvailable}
          onClick={() => {
            if (!isAvailable) return;
            if (selectedSeat && Number(selectedSeat.seatNumber) === Number(seatNum)) {
              onSelectSeat(null);
            } else {
              onSelectSeat(seatObj);
            }
          }}
          className="focus:outline-none focus:ring-0 relative block cursor-pointer"
          title={`Desk #${seatNum} • ${seatObj.status} (${isAvailable ? 'Click to select' : 'Booked'})`}
        >
          <svg 
            width="36" 
            height="38" 
            viewBox="0 0 36 38" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: filterStyle }}
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-[34px] md:h-[36px] transition-transform duration-150"
          >
            {/* 1. Curved Recliner Headrest */}
            <rect 
              x="6" 
              y="1.5" 
              width="24" 
              height="10" 
              rx="4" 
              fill={backrestFill} 
              stroke={strokeColor} 
              strokeWidth="0.8" 
            />
            {/* Headrest stitching groove */}
            <line x1="10" y1="6.5" x2="26" y2="6.5" stroke={strokeColor} strokeOpacity="0.4" strokeDasharray="1.5 1.5" strokeWidth="0.6" />

            {/* 2. Left 3D Armrest */}
            <rect 
              x="1" 
              y="9" 
              width="4.5" 
              height="25" 
              rx="2.25" 
              fill={armrestFill} 
              stroke={strokeColor} 
              strokeWidth="0.5" 
            />

            {/* 3. Right 3D Armrest */}
            <rect 
              x="30.5" 
              y="9" 
              width="4.5" 
              height="25" 
              rx="2.25" 
              fill={armrestFill} 
              stroke={strokeColor} 
              strokeWidth="0.5" 
            />

            {/* 4. Center Seat Cushion Base */}
            <rect 
              x="6.5" 
              y="12" 
              width="23" 
              height="23" 
              rx="4" 
              fill={cushionFill} 
              stroke={strokeColor} 
              strokeWidth="0.8" 
            />

            {/* Cushion contour curve */}
            <path 
              d="M 9.5 24 Q 18 26.5 26.5 24" 
              fill="none" 
              stroke={strokeColor} 
              strokeOpacity="0.35" 
              strokeWidth="0.75" 
            />

            {/* 5. Desk Number Typography */}
            <text 
              x="18" 
              y="30" 
              textAnchor="middle" 
              fill={textColor} 
              fontSize="10" 
              fontWeight="900" 
              fontFamily="monospace, ui-monospace, sans-serif"
              letterSpacing="-0.5px"
            >
              {seatNum}
            </text>
          </svg>

          {/* Golden Checkmark Badge on Selected Desk */}
          {isSelected && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-purple-950 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black shadow-md border border-white">
              ✓
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white border border-purple-100/90 text-slate-900 rounded-3xl shadow-xl shadow-purple-900/5 transition-colors overflow-hidden">
      
      {/* SVG Gradient Definitions for 3D Recliner Seats */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* 🟣 Available Desks: Royal Purple / Violet Palette */}
          <linearGradient id="gradAvailPurpleBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>
          <linearGradient id="gradAvailPurpleCushion" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>

          {/* ⭐ Selected Desk: Radiant Golden Amber Palette (NOT green) */}
          <linearGradient id="gradSelectedGoldBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="gradSelectedGoldCushion" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* ⚪ Occupied / Booked Desks: Sleek Theater Slate Gray */}
          <linearGradient id="gradOccBackLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* 🟠 Reserved Desks */}
          <linearGradient id="gradResBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>

      {/* ========================================================
          1. HEADER CONTROLS & SEAT FLOOR INFORMATION
         ======================================================== */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full font-mono uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
              🎬 3D Cinema Seating Terminal
            </span>
            <span className="text-[11px] text-purple-700 font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>102 Desks Real-Time Map</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Brain Dock 102-Seat Reading Floor
          </h2>
          <p className="text-xs text-slate-500">
            Select any purple recliner desk to reserve. Desks feature high-speed charging sockets & silent focus lighting.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2.5 self-stretch md:self-auto justify-end">
          <div className="flex items-center rounded-xl p-1 border border-slate-200 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.1))}
              className="p-1.5 text-slate-500 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 font-bold min-w-[42px] text-center text-slate-700">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(1.25, prev + 0.1))}
              className="p-1.5 text-slate-500 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-500 hover:text-purple-700 rounded-lg transition-colors border-l border-slate-200 ml-1 cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. STATUS LEGEND & SEAT COUNTERS
         ======================================================== */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* Available Desks (Purple) */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-gradient-to-b from-purple-500 to-purple-800 shadow-sm shadow-purple-600/30" />
            <span className="text-slate-700">Available ({availableCount})</span>
          </div>

          {/* Booked Desks (Slate Gray) */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-slate-300 border-b-2 border-slate-400" />
            <span className="text-slate-500">Booked ({bookedCount})</span>
          </div>

          {/* Selected Desk (Golden Amber - NOT Green) */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-gradient-to-b from-amber-400 to-amber-600 ring-2 ring-amber-300 shadow-md shadow-amber-500/40" />
            <span className="text-amber-700 font-bold">Selected Desk</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
          <Compass className="w-3.5 h-3.5 text-purple-600" />
          <span>Turnstile Entry at Top-Right</span>
        </div>
      </div>

      {/* ========================================================
          3. MAIN ARCHITECTURAL 3D FLOOR CANVAS (PURE WHITE THEME)
         ======================================================== */}
      <div className="overflow-x-auto p-4 sm:p-6 lg:p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] bg-[#FAF8FE]">
        
        {/* Scalable Container Frame */}
        <div 
          className="min-w-[820px] max-w-5xl mx-auto transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoomLevel})` }}
        >

          {/* Pure White Blueprint Shell */}
          <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-7 shadow-xl shadow-purple-950/5">

            {/* ----------------------------------------------------
                A. TOP WALL: SEATS 9 TO 5 | EMERGENCY DOOR | SEATS 4 TO 1 | CUPBOARD
               ---------------------------------------------------- */}
            <div className="mb-6 p-4 rounded-2xl border border-purple-100 bg-purple-50/30">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                
                {/* Desks 9 down to 5 */}
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <div className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border border-purple-200 bg-purple-50 text-purple-900 mr-1">
                    TOP WALL
                  </div>
                  {topWallLeft.map(num => render3DReclinerSeat(num))}
                </div>

                {/* Emergency Door in the middle */}
                <div className="flex items-center space-x-2 bg-gradient-to-r from-rose-50 to-rose-100/80 border border-rose-300 text-rose-800 px-3 py-1.5 rounded-xl shadow-xs select-none">
                  <DoorOpen className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                  <div className="leading-tight">
                    <span className="text-[10px] font-black uppercase font-mono tracking-widest block">
                      EMERGENCY EXIT 🚪
                    </span>
                    <span className="text-[8px] text-rose-600 font-mono block">Safety Door</span>
                  </div>
                </div>

                {/* Desks 4 down to 1 */}
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  {topWallRight.map(num => render3DReclinerSeat(num))}
                </div>

                {/* Cupboard at Top Right Corner */}
                <div className="flex items-center space-x-2.5 bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-200 px-3.5 py-2 rounded-xl shadow-2xs shrink-0">
                  <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-extrabold text-amber-950 uppercase font-mono tracking-wider">
                      CUPBOARD
                    </span>
                    <span className="block text-[9px] text-amber-700 font-medium">Book Storage</span>
                  </div>
                </div>

              </div>

              {/* Horizontal Corridor Walkway */}
              <div className="flex items-center justify-center space-x-3 pt-3 mt-3 border-t border-dashed border-slate-200 text-[10px] font-mono tracking-widest text-slate-400 uppercase select-none">
                <span>🚶</span>
                <span>MAIN NORTH CORRIDOR & AISLE WALKWAY</span>
                <span>🚶</span>
              </div>
            </div>

            {/* ----------------------------------------------------
                B. MAIN FLOOR GRID: LEFT WALL | 3 WORKSTATION ISLANDS | RIGHT WALL
               ---------------------------------------------------- */}
            <div className="grid grid-cols-[105px_1fr_125px] sm:grid-cols-[115px_1fr_135px] gap-4 sm:gap-5 items-stretch">
              
              {/* ============ LEFT WALL COLUMN ============ */}
              <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20 flex flex-col justify-between">
                <div className="text-center pb-2 border-b border-purple-100">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 block">
                    LEFT WALL
                  </span>
                </div>

                {/* Block 1: Seats 10, 11, 12, 13, 14 (10 at the top near 11) */}
                <div className="space-y-1 my-1.5">
                  {leftWallCol1.map(num => render3DReclinerSeat(num))}
                </div>

                <div className="text-[8px] font-mono text-center text-slate-400 uppercase py-1 border-y border-dashed border-slate-200">
                  Aisle
                </div>

                {/* Block 2: Seats 35, 36, 37 */}
                <div className="space-y-1 my-1.5">
                  {leftWallCol2.map(num => render3DReclinerSeat(num))}
                </div>

                <div className="text-[8px] font-mono text-center text-slate-400 uppercase py-1 border-y border-dashed border-slate-200">
                  Aisle
                </div>

                {/* Block 3: Seats 60, 61, 62, 63 */}
                <div className="space-y-1 my-1.5">
                  {leftWallCol3.map(num => render3DReclinerSeat(num))}
                </div>

                <div className="text-[8px] font-mono text-center text-slate-400 uppercase py-1 border-y border-dashed border-slate-200">
                  Aisle
                </div>

                {/* Block 4: Seats 87, 88, 89 */}
                <div className="space-y-1 my-1.5">
                  {leftWallCol4.map(num => render3DReclinerSeat(num))}
                </div>
              </div>

              {/* ============ CENTER STUDY POD ISLANDS ============ */}
              <div className="space-y-5">
                
                {/* ISLAND 1: DESKS 15-24 (Top) & 34-25 (Bottom) */}
                <div className="p-3 sm:p-4 rounded-2xl border border-purple-100 bg-white shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-mono">
                    <span className="font-extrabold text-purple-900 tracking-wider">
                      STUDY POD 1 • 20 DESKS
                    </span>
                    <span className="text-slate-500">⚡ AC/USB Fast Sockets</span>
                  </div>

                  {/* Row A: 15 to 24 */}
                  <div className="flex items-center justify-between gap-1">
                    {island1RowA.map(num => render3DReclinerSeat(num))}
                  </div>

                  {/* Architectural Luxury Walnut Table Surface */}
                  <div className="my-2.5 h-6 rounded-lg bg-gradient-to-r from-[#533017] via-[#754422] to-[#533017] border border-amber-600/40 shadow-inner flex items-center justify-between px-3 select-none">
                    <div className="flex items-center space-x-1 text-[8px] text-amber-300 font-mono font-bold">
                      <Zap className="w-2.5 h-2.5 text-amber-300" />
                      <span>POWER HUB</span>
                    </div>
                    <div className="h-0.5 flex-1 mx-3 bg-amber-400/30 rounded-full" />
                    <div className="text-[8px] text-amber-200 font-mono font-bold">
                      WARM LED LAMPS
                    </div>
                  </div>

                  {/* Row B: 34 down to 25 */}
                  <div className="flex items-center justify-between gap-1">
                    {island1RowB.map(num => render3DReclinerSeat(num))}
                  </div>
                </div>

                {/* Corridor Walkway */}
                <div className="text-center text-[9px] font-mono tracking-widest text-slate-400 uppercase select-none flex items-center justify-center space-x-2">
                  <span>🚶 CENTRAL AISLE WALKWAY 🚶</span>
                </div>

                {/* ISLAND 2: DESKS 38-47 (Top) & 59-50 (Bottom) */}
                <div className="p-3 sm:p-4 rounded-2xl border border-purple-100 bg-white shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-mono">
                    <span className="font-extrabold text-indigo-900 tracking-wider">
                      STUDY POD 2 • 20 DESKS
                    </span>
                    <span className="text-slate-500">⚡ AC/USB Fast Sockets</span>
                  </div>

                  {/* Row A: 38 to 47 */}
                  <div className="flex items-center justify-between gap-1">
                    {island2RowA.map(num => render3DReclinerSeat(num))}
                  </div>

                  {/* Architectural Luxury Walnut Table Surface */}
                  <div className="my-2.5 h-6 rounded-lg bg-gradient-to-r from-[#533017] via-[#754422] to-[#533017] border border-amber-600/40 shadow-inner flex items-center justify-between px-3 select-none">
                    <div className="flex items-center space-x-1 text-[8px] text-amber-300 font-mono font-bold">
                      <Zap className="w-2.5 h-2.5 text-amber-300" />
                      <span>POWER HUB</span>
                    </div>
                    <div className="h-0.5 flex-1 mx-3 bg-amber-400/30 rounded-full" />
                    <div className="text-[8px] text-amber-200 font-mono font-bold">
                      WARM LED LAMPS
                    </div>
                  </div>

                  {/* Row B: 59 down to 50 */}
                  <div className="flex items-center justify-between gap-1">
                    {island2RowB.map(num => render3DReclinerSeat(num))}
                  </div>
                </div>

                {/* Corridor Walkway */}
                <div className="text-center text-[9px] font-mono tracking-widest text-slate-400 uppercase select-none flex items-center justify-center space-x-2">
                  <span>🚶 CENTRAL AISLE WALKWAY 🚶</span>
                </div>

                {/* ISLAND 3: DESKS 64-73 (Top) & 86-77 (Bottom) */}
                <div className="p-3 sm:p-4 rounded-2xl border border-purple-100 bg-white shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-mono">
                    <span className="font-extrabold text-purple-900 tracking-wider">
                      STUDY POD 3 • 20 DESKS
                    </span>
                    <span className="text-slate-500">⚡ AC/USB Fast Sockets</span>
                  </div>

                  {/* Row A: 64 to 73 */}
                  <div className="flex items-center justify-between gap-1">
                    {island3RowA.map(num => render3DReclinerSeat(num))}
                  </div>

                  {/* Architectural Luxury Walnut Table Surface */}
                  <div className="my-2.5 h-6 rounded-lg bg-gradient-to-r from-[#533017] via-[#754422] to-[#533017] border border-amber-600/40 shadow-inner flex items-center justify-between px-3 select-none">
                    <div className="flex items-center space-x-1 text-[8px] text-amber-300 font-mono font-bold">
                      <Zap className="w-2.5 h-2.5 text-amber-300" />
                      <span>POWER HUB</span>
                    </div>
                    <div className="h-0.5 flex-1 mx-3 bg-amber-400/30 rounded-full" />
                    <div className="text-[8px] text-amber-200 font-mono font-bold">
                      WARM LED LAMPS
                    </div>
                  </div>

                  {/* Row B: 86 down to 77 */}
                  <div className="flex items-center justify-between gap-1">
                    {island3RowB.map(num => render3DReclinerSeat(num))}
                  </div>
                </div>

                {/* Corridor Walkway */}
                <div className="text-center text-[9px] font-mono tracking-widest text-slate-400 uppercase select-none flex items-center justify-center space-x-2">
                  <span>🚶 SOUTH AISLE WALKWAY 🚶</span>
                </div>

                {/* BOTTOM ROW: DESKS 90 TO 99 */}
                <div className="p-3 sm:p-4 rounded-2xl border border-purple-100 bg-white shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-mono">
                    <span className="font-extrabold text-slate-900 tracking-wider">
                      SOLO STUDY ROW • DESKS 90 - 99
                    </span>
                    <span className="text-slate-500">Quiet Wall Counter</span>
                  </div>

                  {/* Walnut Study Counter Surface */}
                  <div className="mb-2 h-4 rounded-md bg-gradient-to-r from-[#533017] via-[#754422] to-[#533017] border border-amber-600/40 shadow-inner" />

                  {/* Desks 90 to 99 */}
                  <div className="flex items-center justify-between gap-1">
                    {bottomRow.map(num => render3DReclinerSeat(num))}
                  </div>
                </div>

              </div>

              {/* ============ RIGHT WALL COLUMN ============ */}
              <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20 flex flex-col justify-between">
                <div className="text-center pb-2 border-b border-purple-100">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 block">
                    RIGHT WALL
                  </span>
                </div>

                {/* MAIN ENTRANCE & STAFF RECEPTION DESK */}
                <div className="space-y-2 my-1">
                  {/* Turnstile Access Speed Gate */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-2.5 rounded-xl text-center shadow-2xs">
                    <DoorOpen className="w-4 h-4 text-purple-700 mx-auto animate-pulse" />
                    <span className="text-[10px] font-black text-purple-950 block uppercase font-mono tracking-wider mt-0.5">
                      MAIN ENTRY 🚪
                    </span>
                    <span className="text-[8px] text-purple-600 font-medium block">
                      Turnstile Gate
                    </span>
                  </div>

                  {/* Staff Desk ("TABLE") */}
                  <div className="bg-gradient-to-br from-purple-100/60 to-purple-50 border border-purple-200 p-2.5 rounded-xl text-center shadow-2xs">
                    <User className="w-4 h-4 text-purple-700 mx-auto" />
                    <span className="text-[10px] font-extrabold text-purple-900 block font-mono mt-0.5">
                      TABLE
                    </span>
                    <span className="text-[8px] text-purple-600 block">
                      Staff Reception
                    </span>
                  </div>
                </div>

                {/* Pillar 1 */}
                <div className="bg-slate-100 border border-slate-200 py-1 rounded-lg text-center text-[8px] font-mono text-slate-500">
                  ■ PILLAR
                </div>

                {/* Seats 48, 49 */}
                <div className="space-y-1 my-1.5">
                  {rightWallCol1.map(num => render3DReclinerSeat(num))}
                </div>

                {/* Seats 74, 75, 76 */}
                <div className="space-y-1 my-1.5">
                  {rightWallCol2.map(num => render3DReclinerSeat(num))}
                </div>

                {/* Pillar 2 */}
                <div className="bg-slate-100 border border-slate-200 py-1 rounded-lg text-center text-[8px] font-mono text-slate-500">
                  ■ PILLAR
                </div>

                {/* Seats 100, 101, 102 */}
                <div className="space-y-1 my-1.5">
                  {rightWallCol3.map(num => render3DReclinerSeat(num))}
                </div>

                {/* Corner Structural Pillar (NO entrance here!) */}
                <div className="bg-slate-100 border border-slate-200 py-1.5 rounded-lg text-center text-[8px] font-mono text-slate-500">
                  ■ PILLAR
                </div>
              </div>

            </div>

            {/* ----------------------------------------------------
                C. BOTTOM WALL AMENITY SUITES: GIRL WASHROOM | BOY WASHROOM | PANTRY
               ---------------------------------------------------- */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Girl Washroom */}
                <div className="bg-pink-50/70 border border-pink-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-pink-100 text-pink-700 border border-pink-200">
                      <DoorOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-pink-900">Girl Washroom</h4>
                      <p className="text-[9px] text-pink-600">Clean & Hygienic</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-pink-700 bg-white px-2.5 py-1 rounded-md border border-pink-200">
                    DOOR 🚪
                  </span>
                </div>

                {/* Boy Washroom */}
                <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
                      <DoorOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">Boy Washroom</h4>
                      <p className="text-[9px] text-blue-600">Sanitized Daily</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200">
                    DOOR 🚪
                  </span>
                </div>

                {/* Pantry Room */}
                <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">Pantry Room</h4>
                      <p className="text-[9px] text-amber-700">RO Drinking Water</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-800 bg-white px-2.5 py-1 rounded-md border border-amber-200">
                    DOOR 🚪
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>



      {/* Floating Hover Info Pill */}
      {hoveredSeat && !selectedSeat && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center space-x-3 pointer-events-none animate-in fade-in backdrop-blur-md">
          <div className={`w-3 h-3 rounded-full ${
            hoveredSeat.status === 'Available' ? 'bg-purple-400 animate-pulse' : 'bg-rose-400'
          }`} />
          <div className="text-xs">
            <span className="font-bold text-purple-300 font-mono">Desk #{hoveredSeat.seatNumber}</span>
            <span className="text-slate-300 ml-2">Status: <strong>{hoveredSeat.status}</strong></span>
          </div>
        </div>
      )}

    </div>
  );
}
