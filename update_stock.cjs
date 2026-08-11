const fs = require('fs');
const path = require('path');

const rawData = `
1	https://dummyimage.com/800x800.png&text=P001+Qasa+Blender+Small	Qasa Blender Small Size	Compact Qasa blender for everyday kitchen blending tasks.	65000
1	https://dummyimage.com/800x800.png&text=P002+Qasa+Blender+Big+Size	Qasa Blender Big Size	Large-capacity Qasa blender for heavier kitchen blending tasks.	95000
3	https://dummyimage.com/800x800.png&text=P003+Boscon+Electric	Boscon Electric Kettle	Electric kettle for quick water boiling at home or in the office.	15000
2	https://dummyimage.com/800x800.png&text=P004+Qasa+Electric	Qasa Electric Pressing Iron	Qasa dry pressing iron for regular clothes ironing.	15000
2	https://dummyimage.com/800x800.png&text=P005+Qasa+Steam+Spray	Qasa Steam/Spray Electric Iron	Qasa steam and spray electric iron for smoother ironing.	15000
2	https://dummyimage.com/800x800.png&text=P006+Century+Pressing+Iron	Century Pressing Iron	Century electric pressing iron for everyday garment care.	25000
1	https://dummyimage.com/800x800.png&text=P007+Qasa+18+Inch	Qasa 18-Inch Rechargeable Fan	18-inch rechargeable fan for backup cooling during power outages.	140000
1	https://dummyimage.com/800x800.png&text=P008+Qasa+18+Inch+Standing	Qasa 18-Inch Standing Fan - Premium Model	18-inch Qasa standing fan, premium stock-list model.	80000
1	https://dummyimage.com/800x800.png&text=P009+Qasa+18+Inch+Standing	Qasa 18-Inch Standing Fan - Standard Model	18-inch Qasa standing fan, standard stock-list model.	75000
1	https://dummyimage.com/800x800.png&text=P010+Qasa+16+Inch+Standing	Qasa 16-Inch Standing Fan	16-inch Qasa standing fan for home and office cooling.	75000
4	https://dummyimage.com/800x800.png&text=P011+Kiki+Hair+Clipper	Kiki Hair Clipper	Kiki electric hair clipper for barber and personal grooming use.	25000
1	https://dummyimage.com/800x800.png&text=P012+3KVA+Volt+Stabilizer	3KVA Volt Stabilizer 2000W	2000W voltage stabilizer for protecting appliances from voltage fluctuation.	95000
1	https://dummyimage.com/800x800.png&text=P013+Century+2000W	Century 2000W Stabilizer	Century 2000W voltage stabilizer for home electronics and appliances.	150000
1	https://dummyimage.com/800x800.png&text=P014+Firman+SPG3000	Firman SPG3000 Generator	Firman SPG3000 portable generator for backup power supply.	470000
1	https://dummyimage.com/800x800.png&text=P015+Firman+SPG3000E2	Firman SPG3000E2 Generator	Firman SPG3000E2 generator with higher-capacity backup power support.	520000
2	https://dummyimage.com/800x800.png&text=P016+1+2mm+200+Extension	1/2mm 200 Extension Cable	1/2mm extension cable for electrical power connections.	8000
10	https://dummyimage.com/800x800.png&text=P017+Power+Surge+Protector	Power Surge Protector (CV Guard)	Power surge protector and CV guard for appliance voltage protection.	8000
3	https://dummyimage.com/800x800.png&text=P018+3+Meter+HDMI+Cable	3 Meter HDMI Cable	3 meter HDMI cable for TVs, decoders, monitors, and media devices.	5000
3	https://dummyimage.com/800x800.png&text=P019+1+5+Meter+HDMI+Cable	1.5 Meter HDMI Cable	1.5 meter HDMI cable for short-distance media connections.	4000
3	https://dummyimage.com/800x800.png&text=P020+5+Meter+HDMI+Cable	5 Meter HDMI Cable	5 meter HDMI cable for longer TV and media connections.	5500
1	https://dummyimage.com/800x800.png&text=P021+AKT+Extension+Socket	AKT Extension Socket	AKT extension socket for multiple power connections.	15000
2	https://dummyimage.com/800x800.png&text=P022+Hisense+AC+Remote	Hisense AC Remote Control	Replacement remote control for Hisense air conditioners.	7500
2	https://dummyimage.com/800x800.png&text=P023+Hisense+Smart+TV	Hisense Smart TV Remote Control	Replacement remote for Hisense smart TVs.	8500
2	https://dummyimage.com/800x800.png&text=P024+Hisense+Non-Smart+TV	Hisense Non-Smart TV Remote Control	Replacement remote for standard Hisense non-smart TVs.	5000
1	https://dummyimage.com/800x800.png&text=P025+APC+Extension+Socket	APC Extension Socket	APC brand extension socket for secure electrical connections.	9500
1	https://dummyimage.com/800x800.png&text=P026+6815+Extension+Socket	6815 Extension Socket	6815 model extension socket for standard home appliances.	15000
1	https://dummyimage.com/800x800.png&text=P027+15W45+Extension+Socket	15W45 Extension Socket	15W45 heavy-duty extension socket for higher capacity appliances.	35000
1	https://dummyimage.com/800x800.png&text=P028+20B5+Extension+Socket	20B5 Extension Socket	20B5 extension socket, durable for everyday use.	40000
1	https://dummyimage.com/800x800.png&text=P029+085+Extension+Socket	085 Extension Socket with 11 USB Ports	Multi-purpose 085 extension socket with 11 USB charging ports.	45000
1	https://dummyimage.com/800x800.png&text=P030+6855+Extension+Socket	6855 Extension Socket	6855 extension socket for connecting multiple devices safely.	20000
2	https://dummyimage.com/800x800.png&text=P031+3310+Extension+Socket	3310 Extension Socket	3310 model standard extension socket for home use.	9500
2	https://dummyimage.com/800x800.png&text=P032+916+Extension+Socket	916 Extension Socket	916 standard multi-plug extension socket.	8000
1	https://dummyimage.com/800x800.png&text=P033+POS+Extension+Socket	POS Extension Socket	Specially designed extension socket suitable for POS terminals.	10000
1	https://dummyimage.com/800x800.png&text=P034+Shure+Extension+Socket	Shure Extension Socket	Shure brand extension socket for stable power supply.	12000
1	https://dummyimage.com/800x800.png&text=P035+JPC+Extension+Socket	JPC Extension Socket	JPC brand standard extension socket for multiple appliances.	12500
2	https://dummyimage.com/800x800.png&text=P036+C140+Dining+Table	C140 Dining Table (Black)	C140 black dining table, elegant and durable for the dining room.	115000
2	https://dummyimage.com/800x800.png&text=P037+Pizza+Dining+Table	Pizza Dining Table (Black)	Black Pizza dining table for a stylish dining area.	135000
1	https://dummyimage.com/800x800.png&text=P038+Pizza+Dining+Table	Pizza Dining Table (White)	White Pizza dining table for a bright and modern dining area.	135000
2	https://dummyimage.com/800x800.png&text=P039+2-in-1+Marble+Top	2-in-1 Marble Top Center Table	Set of 2 center tables with a premium marble top finish.	130000
2	https://dummyimage.com/800x800.png&text=P040+3-in-1+Marble+Top	3-in-1 Marble Top Center Table	Set of 3 center tables with a premium marble top finish.	175000
2	https://dummyimage.com/800x800.png&text=P041+3-in-1+Wooden+Center	3-in-1 Wooden Center Table (White/Black)	Set of 3 wooden center tables available in white and black combination.	95000
3	https://dummyimage.com/800x800.png&text=P042+Office+Chair+Black	Office Chair (Black Leg Model)	Ergonomic office chair with sturdy black legs for professional workspaces.	75000
1	https://dummyimage.com/800x800.png&text=P043+Office+Chair+Biggest	Office Chair (Biggest Size)	Extra-large, highly comfortable executive office chair.	155000
2	https://dummyimage.com/800x800.png&text=P044+Office+Chair+With	Office Chair With Headrest	Ergonomic office chair featuring a built-in headrest for neck support.	105000
2	https://dummyimage.com/800x800.png&text=P045+Office+Chair+Without	Office Chair Without Headrest	Standard ergonomic office chair without a headrest.	85000
1	https://dummyimage.com/800x800.png&text=P046+Hisense+HC245H+Deep	Hisense HC245H Deep Freezer	Hisense HC245H chest freezer for long-term food preservation.	330000
1	https://dummyimage.com/800x800.png&text=P047+LG+8kg+Washing	LG 8kg Washing Machine	LG 8kg washing machine for efficient and high-capacity laundry.	420000
1	https://dummyimage.com/800x800.png&text=P048+Hisense+7.5kg+Washing	Hisense 7.5kg Washing Machine	Hisense 7.5kg washing machine for regular family laundry needs.	270000
1	https://dummyimage.com/800x800.png&text=P049+Hisense+140W+Soundbar	Hisense 140W Soundbar	140W Hisense soundbar for enhanced TV audio experience.	140000
1	https://dummyimage.com/800x800.png&text=P050+Hisense+200W+Soundbar	Hisense 200W Soundbar	200W Hisense soundbar for powerful and immersive home theater sound.	175000
1	https://dummyimage.com/800x800.png&text=P051+Hisense+1HP+Inverter	Hisense 1HP Inverter AC (AS09DK)	1HP Hisense inverter air conditioner for energy-efficient room cooling.	430000
1	https://dummyimage.com/800x800.png&text=P052+Hisense+1.5HP+Inverter	Hisense 1.5HP Inverter AC (AS12DK)	1.5HP Hisense inverter air conditioner for efficient cooling of larger rooms.	475000
1	https://dummyimage.com/800x800.png&text=P053+Max+20L+Microwave	Max 20L Microwave	Max 20L capacity microwave for quick food heating and defrosting.	65000
1	https://dummyimage.com/800x800.png&text=P054+Hisense+20L+Microwave	Hisense 20L Microwave	Hisense 20L capacity microwave for reliable everyday kitchen use.	95000
1	https://dummyimage.com/800x800.png&text=P055+Hisense+0932T+Fridge	Hisense 0932T Fridge	Hisense 0932T single door refrigerator for compact spaces.	185000
1	https://dummyimage.com/800x800.png&text=P056+Hisense+1203T+Fridge	Hisense 1203T Fridge	Hisense 1203T refrigerator for standard household food storage.	205000
1	https://dummyimage.com/800x800.png&text=P057+Hisense+190SH+Deep	Hisense 190SH Deep Freezer	Hisense 190SH deep freezer with spacious storage capacity.	290000
2	https://dummyimage.com/800x800.png&text=P058+Hisense+32-Inch+Smart	Hisense 32-Inch Smart TV	32-inch Hisense smart TV for streaming and basic home entertainment.	190000
2	https://dummyimage.com/800x800.png&text=P059+Hisense+43-Inch+Smart	Hisense 43-Inch Smart TV	43-inch Hisense smart TV for a broader and richer viewing experience.	300000
2	https://dummyimage.com/800x800.png&text=P060+OX+Plastic+Standing	OX Plastic Standing Fan	OX plastic standing fan for strong and reliable airflow.	45000
2	https://dummyimage.com/800x800.png&text=P061+Ava+18-Inch+Plastic	Ava 18-Inch Plastic Fan	18-inch Ava plastic fan for regular room cooling.	25000
1	https://dummyimage.com/800x800.png&text=P062+Golden+Breeze+Table	Golden Breeze Table Fan	Compact Golden Breeze table fan for personal cooling.	20000
1	https://dummyimage.com/800x800.png&text=P063+LG+12-Inch+Rechargeable	LG 12-Inch Rechargeable Table Fan	12-inch LG rechargeable table fan, perfect for power outages.	65000
1	https://dummyimage.com/800x800.png&text=P064+Eco+18-Inch+Rechargeable	Eco 18-Inch Rechargeable Fan	18-inch Eco brand rechargeable fan for continuous backup cooling.	70000
1	https://dummyimage.com/800x800.png&text=P065+Jekiyas+18-Inch+Rechargeable	Jekiyas 18-Inch Rechargeable Fan	18-inch Jekiyas rechargeable fan, reliable during power cuts.	75000
1	https://dummyimage.com/800x800.png&text=P066+OX+18-Inch+Industrial	OX 18-Inch Industrial Fan	18-inch OX industrial fan for heavy-duty and powerful airflow.	85000
1	https://dummyimage.com/800x800.png&text=P067+OX+20-Inch+Industrial	OX 20-Inch Industrial Fan	20-inch OX industrial fan for larger spaces requiring strong ventilation.	115000
1	https://dummyimage.com/800x800.png&text=P068+OX+26-Inch+Industrial	OX 26-Inch Industrial Fan	26-inch OX industrial fan for maximum industrial-grade cooling.	135000
1	https://dummyimage.com/800x800.png&text=P069+Golden+Breeze+18-Inch	Golden Breeze 18-Inch Fan	18-inch Golden Breeze fan for everyday household cooling.	35000
1	https://dummyimage.com/800x800.png&text=P070+BB+Pro+18-Inch	BB Pro 18-Inch Fan	18-inch BB Pro fan for efficient air circulation.	35000
1	https://dummyimage.com/800x800.png&text=P071+BB+Wall+18-Inch	BB Wall 18-Inch Fan	18-inch BB wall-mounted fan to save floor space while cooling.	35000
1	https://dummyimage.com/800x800.png&text=P072+My+Fan+18-Inch	My Fan 18-Inch Fan	18-inch 'My Fan' brand for standard room cooling.	25000
1	https://dummyimage.com/800x800.png&text=P073+1HP+AC+Kit	1HP AC Kit	Installation kit for 1HP air conditioning units.	27000
1	https://dummyimage.com/800x800.png&text=P074+1.5HP+AC+Kit	1.5HP AC Kit	Installation kit for 1.5HP air conditioning units.	27000
3	https://dummyimage.com/800x800.png&text=P075+AC+Outdoor+Hanger	AC Outdoor Hanger	Sturdy outdoor wall hanger for AC compressor units.	7000
3	https://dummyimage.com/800x800.png&text=P076+32-Inch+TV+Wall	32-Inch TV Wall Hanger	Secure wall mount bracket for 32-inch televisions.	5000
3	https://dummyimage.com/800x800.png&text=P077+43-Inch+TV+Wall	43-Inch TV Wall Hanger	Secure wall mount bracket for 43-inch televisions.	8000
3	https://dummyimage.com/800x800.png&text=P078+55-Inch+TV+Wall	55-Inch TV Wall Hanger	Secure wall mount bracket for up to 55-inch televisions.	15000
`;

const dataPath = path.join(__dirname, 'src', 'importData.json');
let products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Map name to quantity
const qtyMap = {};
rawData.trim().split('\n').forEach(line => {
  const [qty, image, name] = line.split('\t');
  qtyMap[name] = parseInt(qty, 10);
});

products = products.map(p => {
  return {
    ...p,
    stock: qtyMap[p.name] || 0
  };
});

fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
console.log('Successfully injected stock quantities into importData.json!');
