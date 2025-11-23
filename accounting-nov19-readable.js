const __vite__mapDeps = (i, m = __vite__mapDeps, d = (m.f || (m.f = ["assets/IncomeTab-czrP9sRK.js", "assets/react-vendor-DBHNAGPW.js", "assets/chart-vendor-R5Y1AjBI.js", "assets/index-BB04Wo6n.js", "assets/state-vendor-JOdu_MDH.js", "assets/ui-vendor-Vc_pfhQB.js", "assets/index-CByBT1Ac.css", "assets/index-C5wiI25D.js", "assets/ExpenseTab-k5Z33Y5H.js", "assets/InvoiceList-r5D-a0Sv.js", "assets/OfferList-CniZt4xK.js", "assets/AccountingDashboard-DH7Uoszm.js", "assets/CategoricalChart-CWQd-BIh.js", "assets/LineChart-DquekLLL.js", "assets/BarChart-C6yCk-EP.js", "assets/Legend-BZ-cqQwb.js", "assets/AreaChart-iTH8IB05.js", "assets/PieChart-BMCiRpQ9.js", "assets/AccountCardList-C5Ryhl-s.js", "assets/EInvoiceList-CcvFn7DP.js", "assets/BankReconciliation-DMwfYIQ2.js", "assets/DeliveryNoteList-BJx3PtRa.js", "assets/InventoryAccounting-CO6uUTdR.js", "assets/AdvancedReporting-BHJvQpgi.js", "assets/CompanyInfo-DZ06CKp_.js", "assets/api-BEHK5nhM.js", "assets/CashBankManagement-B_aINLX5.js", "assets/ReminderManagement-mLlcEIfk.js", "assets/StatementSharing-CMtZvCpf.js", "assets/BarcodeScanner-poJd98YV.js", "assets/NotificationsTab-C5M_gowH.js", "assets/ToolsTab-BZ8sw7IO.js", "assets/ActionCard-DOrtAOyK.js", "assets/IntegrationsTab-LzZ0lInN.js", "assets/SupportTab-99YNF7Bd.js", "assets/CostAccounting-CqSS1aJm.js"]))) => i.map(i => d[i]);
var ja = Object.defineProperty;
var ga = (a, y, l) => y in a ? ja(a, y, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: l
}) : a[y] = l;
var ms = (a, y, l) => ga(a, typeof y != "symbol" ? y + "" : y, l);
import {
    c as us,
    p as hs,
    d as ba,
    i as fa,
    o as Na,
    e as va,
    _ as fe
} from "./index-BB04Wo6n.js";
import {
    r as t,
    j as e,
    z as O,
    R as wa,
    a as ka,
    q as Sa,
    t as Be
} from "./react-vendor-DBHNAGPW.js";
import {
    c as I,
    D as s,
    i as be,
    b as P,
    a as p,
    s as De,
    t as Ve
} from "./index-C5wiI25D.js";
import {
    X as oa,
    A as Xe,
    v as Fe,
    C as Ea,
    u as da,
    w as Oe,
    a0 as Ze,
    F as xs,
    o as ma,
    a6 as $a,
    ac as Ca,
    aH as fs,
    D as ts,
    R as ls,
    ae as ss,
    b as as,
    ag as js,
    a5 as Ns,
    ap as vs,
    aI as ps,
    f as rs,
    aJ as Ta,
    aK as Aa,
    z as ws,
    E as xa,
    a2 as ys,
    n as Da,
    H as za,
    aA as La,
    e as Ia,
    P as ca,
    aL as Pa,
    m as _a,
    G as Ba
} from "./ui-vendor-Vc_pfhQB.js";
import {
    e as Ra,
    a as Fa,
    b as Oa,
    c as Ma
} from "./excelExport-CU8dz2Bm.js";
import "./state-vendor-JOdu_MDH.js";
import "./chart-vendor-R5Y1AjBI.js";
import "./xlsx-DrgRuPKf.js";

function ia(a, y = 500) {
    const [l, n] = t.useState(a);
    return t.useEffect(() => {
        const r = setTimeout(() => {
            n(a)
        }, y);
        return () => {
            clearTimeout(r)
        }
    }, [a, y]), l
}

function Ya({
    open: a,
    onClose: y,
    onSaved: l,
    initial: n
}) {
    var C, z, b, f;
    const [r, v] = t.useState({
        checkNumber: "",
        drawer: "",
        bank: "",
        branch: "",
        accountNumber: "",
        amount: 0,
        issueDate: "",
        dueDate: "",
        status: "pending",
        customerId: void 0,
        notes: ""
    }), [x, D] = t.useState(!1);
    if (t.useEffect(() => {
            n && v({
                ...r,
                ...n
            })
        }, [n]), !a) return null;
    const h = E => {
            const {
                name: j,
                value: Y
            } = E.target;
            v(T => ({
                ...T,
                [j]: j === "amount" ? parseFloat(Y || "0") : Y
            }))
        },
        q = async E => {
            E.preventDefault();
            try {
                D(!0), n != null && n.id ? await us.update(n.id, r) : await us.create(r), l && l(), y()
            } catch (j) {
                console.error("Check save error", j), alert("Kaydetme sırasında hata oluştu")
            } finally {
                D(!1)
            }
        };
    return e.jsx("div", {
        className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4",
        children: e.jsxs("div", {
            className: I(p("lg", "sm", "elevated"), "w-full max-w-3xl max-h-[90vh] overflow-y-auto"),
            children: [e.jsx("h3", {
                className: `${(z=(C=s)==null?void 0:C.typography)==null?void 0:z.h3} ${(f=(b=s)==null?void 0:b.colors)==null?void 0:f.text.primary} mb-6`,
                children: n != null && n.id ? "Çek Düzenle" : "Yeni Çek"
            }), e.jsxs("form", {
                onSubmit: q,
                className: "space-y-4",
                children: [e.jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    children: [e.jsx("input", {
                        name: "checkNumber",
                        value: r.checkNumber,
                        onChange: h,
                        placeholder: "Çek No",
                        className: be("md")
                    }), e.jsx("input", {
                        name: "drawer",
                        value: r.drawer,
                        onChange: h,
                        placeholder: "Düzenleyen",
                        className: be("md")
                    }), e.jsx("input", {
                        name: "bank",
                        value: r.bank,
                        onChange: h,
                        placeholder: "Banka",
                        className: be("md")
                    }), e.jsx("input", {
                        name: "amount",
                        type: "number",
                        value: r.amount,
                        onChange: h,
                        placeholder: "Tutar",
                        className: be("md")
                    }), e.jsx("input", {
                        name: "dueDate",
                        type: "date",
                        value: r.dueDate,
                        onChange: h,
                        className: be("md")
                    })]
                }), e.jsx("textarea", {
                    name: "notes",
                    value: r.notes,
                    onChange: h,
                    placeholder: "Notlar",
                    rows: 4,
                    className: be("md")
                }), e.jsxs("div", {
                    className: "flex justify-end gap-3 pt-4 border-t",
                    children: [e.jsx("button", {
                        type: "button",
                        onClick: y,
                        className: P("md", "outline", "lg"),
                        children: "Kapat"
                    }), e.jsx("button", {
                        type: "submit",
                        disabled: x,
                        className: I(P("md", "primary", "lg"), "disabled:opacity-50 disabled:cursor-not-allowed"),
                        children: x ? "Kaydediliyor..." : "Kaydet"
                    })]
                })]
            })]
        })
    })
}

function Ha({
    open: a,
    onClose: y,
    onSaved: l,
    initial: n
}) {
    var C, z, b, f, E, j, Y, T, we, Se, Q, _, ke, L, Ne, X, Z, J, W, ee, se, ae, te, re, H, le, M, V, ne, B, R, ce, F, G, ie, K, oe, de, me, xe, ue, he, pe, ye, d, c, $, k, u, U, $e, je, m, Ce;
    const [r, v] = t.useState({
        noteNumber: "",
        type: "received",
        drawer: "",
        beneficiary: "",
        amount: 0,
        issueDate: "",
        dueDate: "",
        issuePlace: "",
        paymentPlace: "",
        status: "pending",
        customerId: void 0,
        notes: ""
    }), [x, D] = t.useState(!1);
    if (t.useEffect(() => {
            n && v({
                ...r,
                ...n
            })
        }, [n]), !a) return null;
    const h = ge => {
            const {
                name: ze,
                value: w
            } = ge.target;
            v(Te => ({
                ...Te,
                [ze]: ze === "amount" ? parseFloat(w || "0") : w
            }))
        },
        q = async ge => {
            ge.preventDefault();
            try {
                D(!0), n != null && n.id ? await hs.update(n.id, r) : await hs.create(r), l && l(), y()
            } catch (ze) {
                console.error("Promissory note save error", ze), alert("Kaydetme sırasında hata oluştu")
            } finally {
                D(!1)
            }
        };
    return e.jsx("div", {
        className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4",
        children: e.jsxs("div", {
            className: I(p("lg", "none", "default", "xl"), "w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"),
            children: [e.jsxs("div", {
                className: I("sticky top-0 bg-white border-b border-neutral-200", (z = (C = s) == null ? void 0 : C.spacing) == null ? void 0 : z.padding.md, "flex items-center justify-between"),
                children: [e.jsx("h3", {
                    className: `${(f=(b=s)==null?void 0:b.typography)==null?void 0:f.h1} ${(j=(E=s)==null?void 0:E.colors)==null?void 0:j.text.primary}`,
                    children: n != null && n.id ? "Senet Düzenle" : "Yeni Senet"
                }), e.jsx("button", {
                    onClick: y,
                    className: "p-2 hover:bg-neutral-100 rounded-lg transition-colors",
                    children: e.jsx(oa, {
                        className: `w-5 h-5 ${(T=(Y=s)==null?void 0:Y.colors)==null?void 0:T.text.secondary}`
                    })
                })]
            }), e.jsxs("form", {
                onSubmit: q,
                className: I((Se = (we = s) == null ? void 0 : we.spacing) == null ? void 0 : Se.padding.md, "space-y-6"),
                children: [e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(_=(Q=s)==null?void 0:Q.typography)==null?void 0:_.body.sm} font-medium ${(L=(ke=s)==null?void 0:ke.colors)==null?void 0:L.text.secondary} mb-2`,
                        children: ["Senet Tipi ", e.jsx("span", {
                            className: "text-neutral-900",
                            children: "*"
                        })]
                    }), e.jsxs("select", {
                        name: "type",
                        value: r.type,
                        onChange: h,
                        required: !0,
                        className: be("md", "default", void 0, "md"),
                        children: [e.jsx("option", {
                            value: "received",
                            children: "Alınan Senet"
                        }), e.jsx("option", {
                            value: "issued",
                            children: "Verilen Senet"
                        })]
                    })]
                }), e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(X=(Ne=s)==null?void 0:Ne.typography)==null?void 0:X.body.sm} font-medium ${(J=(Z=s)==null?void 0:Z.colors)==null?void 0:J.text.secondary} mb-2`,
                        children: ["Senet No ", e.jsx("span", {
                            className: "text-neutral-900",
                            children: "*"
                        })]
                    }), e.jsx("input", {
                        type: "text",
                        name: "noteNumber",
                        value: r.noteNumber,
                        onChange: h,
                        placeholder: "SN-2025-001",
                        required: !0,
                        className: be("md", "default", void 0, "md")
                    })]
                }), e.jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    children: [e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: `block ${(ee=(W=s)==null?void 0:W.typography)==null?void 0:ee.body.sm} font-medium ${(ae=(se=s)==null?void 0:se.colors)==null?void 0:ae.text.secondary} mb-2`,
                            children: ["Düzenleyen ", e.jsx("span", {
                                className: "text-neutral-900",
                                children: "*"
                            })]
                        }), e.jsx("input", {
                            type: "text",
                            name: "drawer",
                            value: r.drawer,
                            onChange: h,
                            placeholder: "Düzenleyen Adı",
                            required: !0,
                            className: be("md", "default", void 0, "md")
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: `block ${(re=(te=s)==null?void 0:te.typography)==null?void 0:re.body.sm} font-medium ${(le=(H=s)==null?void 0:H.colors)==null?void 0:le.text.secondary} mb-2`,
                            children: ["Lehtar ", e.jsx("span", {
                                className: "text-neutral-900",
                                children: "*"
                            })]
                        }), e.jsx("input", {
                            type: "text",
                            name: "beneficiary",
                            value: r.beneficiary,
                            onChange: h,
                            placeholder: "Lehtar Adı",
                            required: !0,
                            className: be("md", "default", void 0, "md")
                        })]
                    })]
                }), e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(V=(M=s)==null?void 0:M.typography)==null?void 0:V.body.sm} font-medium ${(B=(ne=s)==null?void 0:ne.colors)==null?void 0:B.text.secondary} mb-2`,
                        children: ["Tutar (TRY) ", e.jsx("span", {
                            className: "text-neutral-900",
                            children: "*"
                        })]
                    }), e.jsx("input", {
                        type: "number",
                        step: "0.01",
                        name: "amount",
                        value: r.amount,
                        onChange: h,
                        placeholder: "0.00",
                        required: !0,
                        min: "0",
                        className: be("md", "default", void 0, "md")
                    })]
                }), e.jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    children: [e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: `block ${(ce=(R=s)==null?void 0:R.typography)==null?void 0:ce.body.sm} font-medium ${(G=(F=s)==null?void 0:F.colors)==null?void 0:G.text.secondary} mb-2`,
                            children: ["Düzenleme Tarihi ", e.jsx("span", {
                                className: "text-neutral-900",
                                children: "*"
                            })]
                        }), e.jsx("input", {
                            type: "date",
                            name: "issueDate",
                            value: r.issueDate,
                            onChange: h,
                            required: !0,
                            className: be("md", "default", void 0, "md")
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: `block ${(K=(ie=s)==null?void 0:ie.typography)==null?void 0:K.body.sm} font-medium ${(de=(oe=s)==null?void 0:oe.colors)==null?void 0:de.text.secondary} mb-2`,
                            children: ["Vade Tarihi ", e.jsx("span", {
                                className: "text-neutral-900",
                                children: "*"
                            })]
                        }), e.jsx("input", {
                            type: "date",
                            name: "dueDate",
                            value: r.dueDate,
                            onChange: h,
                            required: !0,
                            className: be("md", "default", void 0, "md")
                        })]
                    })]
                }), e.jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    children: [e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: `block ${(xe=(me=s)==null?void 0:me.typography)==null?void 0:xe.body.sm} font-medium ${(he=(ue=s)==null?void 0:ue.colors)==null?void 0:he.text.secondary} mb-2`,
                            children: "Düzenleme Yeri"
                        }), e.jsx("input", {
                            type: "text",
                            name: "issuePlace",
                            value: r.issuePlace,
                            onChange: h,
                            placeholder: "İstanbul",
                            className: be("md", "default", void 0, "md")
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsx("label", {
                            className: `block ${(ye=(pe=s)==null?void 0:pe.typography)==null?void 0:ye.body.sm} font-medium ${(c=(d=s)==null?void 0:d.colors)==null?void 0:c.text.secondary} mb-2`,
                            children: "Ödeme Yeri"
                        }), e.jsx("input", {
                            type: "text",
                            name: "paymentPlace",
                            value: r.paymentPlace,
                            onChange: h,
                            placeholder: "İstanbul",
                            className: be("md", "default", void 0, "md")
                        })]
                    })]
                }), e.jsxs("div", {
                    children: [e.jsx("label", {
                        className: `block ${(k=($=s)==null?void 0:$.typography)==null?void 0:k.body.sm} font-medium ${(U=(u=s)==null?void 0:u.colors)==null?void 0:U.text.secondary} mb-2`,
                        children: "Durum"
                    }), e.jsxs("select", {
                        name: "status",
                        value: r.status,
                        onChange: h,
                        className: be("md", "default", void 0, "md"),
                        children: [e.jsx("option", {
                            value: "pending",
                            children: "Beklemede"
                        }), e.jsx("option", {
                            value: "paid",
                            children: "Ödendi"
                        }), e.jsx("option", {
                            value: "cancelled",
                            children: "İptal Edildi"
                        }), e.jsx("option", {
                            value: "returned",
                            children: "İade Edildi"
                        })]
                    })]
                }), e.jsxs("div", {
                    children: [e.jsx("label", {
                        className: `block ${(je=($e=s)==null?void 0:$e.typography)==null?void 0:je.body.sm} font-medium ${(Ce=(m=s)==null?void 0:m.colors)==null?void 0:Ce.text.secondary} mb-2`,
                        children: "Notlar"
                    }), e.jsx("textarea", {
                        name: "notes",
                        value: r.notes,
                        onChange: h,
                        placeholder: "Senet ile ilgili notlar...",
                        rows: 4,
                        className: be("md", "default", void 0, "md")
                    })]
                }), e.jsxs("div", {
                    className: "flex items-center justify-end gap-3 pt-4 border-t border-neutral-200",
                    children: [e.jsx("button", {
                        type: "button",
                        onClick: y,
                        disabled: x,
                        className: I(P("md", "outline", "lg"), "disabled:opacity-50 disabled:cursor-not-allowed"),
                        children: "İptal"
                    }), e.jsx("button", {
                        type: "submit",
                        disabled: x,
                        className: I(P("md", "primary", "lg"), "disabled:opacity-50 disabled:cursor-not-allowed"),
                        children: x ? "Kaydediliyor..." : n != null && n.id ? "Güncelle" : "Kaydet"
                    })]
                })]
            })]
        })
    })
}

function Va({
    data: a,
    loading: y
}) {
    var E, j, Y, T, we, Se, Q, _, ke, L, Ne, X, Z, J, W, ee, se, ae, te, re, H, le, M, V, ne, B, R, ce, F, G, ie, K, oe, de, me, xe, ue, he, pe, ye, d, c, $, k;
    const [l, n] = t.useState("totalDebt"), [r, v] = t.useState("desc"), x = u => new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY"
    }).format(u), D = (u, U) => U === 0 ? "0%" : `${(u/U*100).toFixed(1)}%`, h = u => {
        l === u ? v(r === "asc" ? "desc" : "asc") : (n(u), v("desc"))
    }, q = () => a != null && a.customers ? [...a.customers].sort((U, $e) => {
        const je = U[l],
            m = $e[l];
        return typeof je == "string" && typeof m == "string" ? r === "asc" ? je.localeCompare(m, "tr") : m.localeCompare(je, "tr") : r === "asc" ? je - m : m - je
    }) : [], C = u => "bg-neutral-100 text-neutral-800", z = () => {
        O.success("Excel dışa aktarma özelliği yakında eklenecek")
    }, b = () => {
        O.success("PDF dışa aktarma özelliği yakında eklenecek")
    };
    if (y) return e.jsx("div", {
        className: "flex items-center justify-center h-64",
        children: e.jsx("div", {
            className: "animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-200"
        })
    });
    if (!a || !a.customers || a.customers.length === 0) return e.jsxs("div", {
        className: p("md", "xl", "default", "lg"),
        children: [e.jsx(Xe, {
            className: "w-12 h-12 text-neutral-400 mx-auto mb-4"
        }), e.jsx("p", {
            className: `${(j=(E=s)==null?void 0:E.typography)==null?void 0:j.body.lg} ${(T=(Y=s)==null?void 0:Y.colors)==null?void 0:T.text.primary} mb-2`,
            children: "Yaşlandırma Verisi Bulunamadı"
        }), e.jsx("p", {
            className: `${(Se=(we=s)==null?void 0:we.typography)==null?void 0:Se.body.sm} ${(_=(Q=s)==null?void 0:Q.colors)==null?void 0:_.text.tertiary}`,
            children: "Müşterilerinizin borç durumunu görmek için fatura ve tahsilat işlemlerini kaydedin."
        })]
    });
    const f = q();
    return e.jsxs("div", {
        className: "space-y-6",
        children: [e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-5 gap-4",
            children: [e.jsxs("div", {
                className: "bg-white rounded-lg p-5 text-white bg-neutral-800",
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [e.jsx(Fe, {
                        className: "w-8 h-8 opacity-80"
                    }), e.jsx("span", {
                        className: "text-xs bg-white/20 px-2 py-1 rounded-full",
                        children: "Toplam"
                    })]
                }), e.jsx("p", {
                    className: `${(L=(ke=s)==null?void 0:ke.typography)==null?void 0:L.stat.md} mb-1`,
                    children: x(a.summary.totalDebt)
                }), e.jsxs("p", {
                    className: `${(X=(Ne=s)==null?void 0:Ne.typography)==null?void 0:X.body.sm} opacity-90`,
                    children: [a.summary.customerCount, " Müşteri"]
                })]
            }), e.jsxs("div", {
                className: I(p("md", "md", "subtle", "md"), "border-2 border-neutral-200"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [e.jsx(Ea, {
                        className: "w-8 h-8 text-neutral-900"
                    }), e.jsx("span", {
                        className: "text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded-full",
                        children: "0-30 Gün"
                    })]
                }), e.jsx("p", {
                    className: `${(J=(Z=s)==null?void 0:Z.typography)==null?void 0:J.stat.md} ${(ee=(W=s)==null?void 0:W.colors)==null?void 0:ee.text.primary} mb-1`,
                    children: x(a.summary.totalCurrent)
                }), e.jsx("p", {
                    className: `${(ae=(se=s)==null?void 0:se.typography)==null?void 0:ae.body.sm} ${(re=(te=s)==null?void 0:te.colors)==null?void 0:re.text.secondary}`,
                    children: D(a.summary.totalCurrent, a.summary.totalDebt)
                })]
            }), e.jsxs("div", {
                className: I(p("md", "md", "subtle", "md"), "border-2 border-neutral-300"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [e.jsx(da, {
                        className: "w-8 h-8 text-neutral-800"
                    }), e.jsx("span", {
                        className: "text-xs bg-neutral-200 text-neutral-800 px-2 py-1 rounded-full",
                        children: "31-60 Gün"
                    })]
                }), e.jsx("p", {
                    className: `${(le=(H=s)==null?void 0:H.typography)==null?void 0:le.stat.md} ${(V=(M=s)==null?void 0:M.colors)==null?void 0:V.text.primary} mb-1`,
                    children: x(a.summary.totalDays30)
                }), e.jsx("p", {
                    className: `${(B=(ne=s)==null?void 0:ne.typography)==null?void 0:B.body.sm} ${(ce=(R=s)==null?void 0:R.colors)==null?void 0:ce.text.secondary}`,
                    children: D(a.summary.totalDays30, a.summary.totalDebt)
                })]
            }), e.jsxs("div", {
                className: I(p("md", "md", "subtle", "md"), "border-2 border-neutral-400"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [e.jsx(Xe, {
                        className: "w-8 h-8 text-neutral-700"
                    }), e.jsx("span", {
                        className: "text-xs bg-neutral-300 text-neutral-800 px-2 py-1 rounded-full",
                        children: "61-90 Gün"
                    })]
                }), e.jsx("p", {
                    className: `${(G=(F=s)==null?void 0:F.typography)==null?void 0:G.stat.md} ${(K=(ie=s)==null?void 0:ie.colors)==null?void 0:K.text.primary} mb-1`,
                    children: x(a.summary.totalDays60)
                }), e.jsx("p", {
                    className: `${(de=(oe=s)==null?void 0:oe.typography)==null?void 0:de.body.sm} ${(xe=(me=s)==null?void 0:me.colors)==null?void 0:xe.text.secondary}`,
                    children: D(a.summary.totalDays60, a.summary.totalDebt)
                })]
            }), e.jsxs("div", {
                className: I(p("md", "md", "subtle", "md"), "border-2 border-neutral-500"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [e.jsx(Oe, {
                        className: "w-8 h-8 text-neutral-600"
                    }), e.jsx("span", {
                        className: "text-xs bg-neutral-300 text-neutral-800 px-2 py-1 rounded-full",
                        children: "90+ Gün"
                    })]
                }), e.jsx("p", {
                    className: `${(he=(ue=s)==null?void 0:ue.typography)==null?void 0:he.stat.md} ${(ye=(pe=s)==null?void 0:pe.colors)==null?void 0:ye.text.primary} mb-1`,
                    children: x(a.summary.totalDays90Plus)
                }), e.jsx("p", {
                    className: `${(c=(d=s)==null?void 0:d.typography)==null?void 0:c.body.sm} ${(k=($=s)==null?void 0:$.colors)==null?void 0:k.text.secondary}`,
                    children: D(a.summary.totalDays90Plus, a.summary.totalDebt)
                })]
            })]
        }), e.jsxs("div", {
            className: "flex items-center justify-end gap-3",
            children: [e.jsxs("button", {
                onClick: z,
                className: I(P("md", "primary", "md"), "gap-2 bg-neutral-900 hover:bg-neutral-800"),
                children: [e.jsx(Ze, {
                    className: "w-4 h-4"
                }), "Excel İndir"]
            }), e.jsxs("button", {
                onClick: b,
                className: I(P("md", "primary", "md"), "gap-2 bg-neutral-900 hover:bg-neutral-800"),
                children: [e.jsx(xs, {
                    className: "w-4 h-4"
                }), "PDF İndir"]
            })]
        }), e.jsx("div", {
            className: I(p("md", "none", "default", "lg"), "overflow-hidden"),
            children: e.jsx("div", {
                className: "overflow-x-auto",
                children: e.jsxs("table", {
                    className: "w-full",
                    children: [e.jsx("thead", {
                        className: "bg-neutral-50 border-b border-neutral-200",
                        children: e.jsxs("tr", {
                            children: [e.jsxs("th", {
                                onClick: () => h("customerName"),
                                className: "px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100",
                                children: ["Müşteri", l === "customerName" && e.jsx("span", {
                                    className: "ml-1",
                                    children: r === "asc" ? "↑" : "↓"
                                })]
                            }), e.jsxs("th", {
                                onClick: () => h("totalDebt"),
                                className: "px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100",
                                children: ["Toplam Borç", l === "totalDebt" && e.jsx("span", {
                                    className: "ml-1",
                                    children: r === "asc" ? "↑" : "↓"
                                })]
                            }), e.jsxs("th", {
                                onClick: () => h("current"),
                                className: "px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-50",
                                children: ["0-30 Gün", l === "current" && e.jsx("span", {
                                    className: "ml-1",
                                    children: r === "asc" ? "↑" : "↓"
                                })]
                            }), e.jsxs("th", {
                                onClick: () => h("days30"),
                                className: "px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-50",
                                children: ["31-60 Gün", l === "days30" && e.jsx("span", {
                                    className: "ml-1",
                                    children: r === "asc" ? "↑" : "↓"
                                })]
                            }), e.jsxs("th", {
                                onClick: () => h("days60"),
                                className: "px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-50",
                                children: ["61-90 Gün", l === "days60" && e.jsx("span", {
                                    className: "ml-1",
                                    children: r === "asc" ? "↑" : "↓"
                                })]
                            }), e.jsxs("th", {
                                onClick: () => h("days90Plus"),
                                className: "px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-50",
                                children: ["90+ Gün", l === "days90Plus" && e.jsx("span", {
                                    className: "ml-1",
                                    children: r === "asc" ? "↑" : "↓"
                                })]
                            })]
                        })
                    }), e.jsx("tbody", {
                        className: "bg-white divide-y divide-neutral-200",
                        children: f.map(u => {
                            var U, $e, je, m;
                            return u.days90Plus > 0 || u.days60 > 0 || u.days30 > 0, e.jsxs("tr", {
                                className: "hover:bg-neutral-50 transition-colors",
                                children: [e.jsx("td", {
                                    className: "px-6 py-4",
                                    children: e.jsx("div", {
                                        className: "flex items-center gap-3",
                                        children: e.jsxs("div", {
                                            children: [e.jsx("p", {
                                                className: `font-medium ${($e=(U=s)==null?void 0:U.colors)==null?void 0:$e.text.primary}`,
                                                children: u.customerName
                                            }), u.overdueAmount > 0 && e.jsxs("p", {
                                                className: "text-xs text-neutral-900 flex items-center gap-1",
                                                children: [e.jsx(Xe, {
                                                    className: "w-3 h-3"
                                                }), x(u.overdueAmount), " vadesi geçmiş"]
                                            })]
                                        })
                                    })
                                }), e.jsxs("td", {
                                    className: "px-6 py-4 text-right",
                                    children: [e.jsx("p", {
                                        className: `font-bold ${(m=(je=s)==null?void 0:je.colors)==null?void 0:m.text.primary}`,
                                        children: x(u.totalDebt)
                                    }), e.jsx("p", {
                                        className: "text-xs text-neutral-500",
                                        children: u.currency
                                    })]
                                }), e.jsxs("td", {
                                    className: "px-6 py-4 text-right",
                                    children: [e.jsx("span", {
                                        className: `inline-flex px-3 py-1 rounded-full text-sm font-medium ${C()}`,
                                        children: x(u.current)
                                    }), e.jsx("p", {
                                        className: "text-xs text-neutral-500 mt-1",
                                        children: D(u.current, u.totalDebt)
                                    })]
                                }), e.jsxs("td", {
                                    className: "px-6 py-4 text-right",
                                    children: [e.jsx("span", {
                                        className: `inline-flex px-3 py-1 rounded-full text-sm font-medium ${C()}`,
                                        children: x(u.days30)
                                    }), e.jsx("p", {
                                        className: "text-xs text-neutral-500 mt-1",
                                        children: D(u.days30, u.totalDebt)
                                    })]
                                }), e.jsxs("td", {
                                    className: "px-6 py-4 text-right",
                                    children: [e.jsx("span", {
                                        className: `inline-flex px-3 py-1 rounded-full text-sm font-medium ${C()}`,
                                        children: x(u.days60)
                                    }), e.jsx("p", {
                                        className: "text-xs text-neutral-500 mt-1",
                                        children: D(u.days60, u.totalDebt)
                                    })]
                                }), e.jsxs("td", {
                                    className: "px-6 py-4 text-right",
                                    children: [e.jsx("span", {
                                        className: `inline-flex px-3 py-1 rounded-full text-sm font-medium ${C()}`,
                                        children: x(u.days90Plus)
                                    }), e.jsx("p", {
                                        className: "text-xs text-neutral-500 mt-1",
                                        children: D(u.days90Plus, u.totalDebt)
                                    })]
                                })]
                            }, u.customerId)
                        })
                    })]
                })
            })
        })]
    })
}

function Ga({
    open: a,
    onClose: y,
    onSaved: l,
    initialData: n
}) {
    var ke, L, Ne, X, Z, J, W, ee, se, ae, te, re, H, le, M, V, ne, B, R, ce, F, G, ie, K, oe, de, me, xe, ue, he, pe, ye;
    const [r, v] = t.useState({
        code: "",
        name: "",
        type: "ASSET",
        parentId: null,
        isActive: !0,
        description: ""
    }), [x, D] = t.useState([]), [h, q] = t.useState(!1), [C, z] = t.useState(!1), [b, f] = t.useState(""), [E, j] = t.useState(!1);
    t.useEffect(() => {
        a && (Y(), v(n ? {
            code: n.code,
            name: n.name,
            type: n.type,
            parentId: n.parentId,
            isActive: n.isActive !== void 0 ? n.isActive : !0,
            description: n.description || ""
        } : {
            code: "",
            name: "",
            type: "ASSET",
            parentId: null,
            isActive: !0,
            description: ""
        }))
    }, [a, n]);
    const Y = async () => {
        try {
            q(!0);
            const d = await fetch("/api/accounting/chart-of-accounts", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!d.ok) throw new Error("Failed to load accounts");
            const c = await d.json(),
                $ = n ? (c.data || c).filter(k => k.id !== n.id) : c.data || c;
            D($)
        } catch (d) {
            console.error("Failed to load accounts:", d), O.error("Hesaplar yüklenemedi")
        } finally {
            q(!1)
        }
    }, T = async d => {
        if (d.preventDefault(), !r.code.trim()) {
            O.error("Hesap kodu gereklidir");
            return
        }
        if (!r.name.trim()) {
            O.error("Hesap adı gereklidir");
            return
        }
        if (!/^\d{3}(\.\d{2}(\.\d{2})?)?$/.test(r.code)) {
            O.error("Hesap kodu formatı: 100 veya 100.01 veya 100.01.01");
            return
        }
        try {
            z(!0);
            const c = n ? `/api/accounting/chart-of-accounts/${n.id}` : "/api/accounting/chart-of-accounts",
                k = await fetch(c, {
                    method: n ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(r)
                });
            if (!k.ok) {
                const u = await k.json();
                throw new Error(u.message || "Failed to save account")
            }
            O.success(n ? "Hesap güncellendi" : "Hesap oluşturuldu"), l(), y()
        } catch (c) {
            O.error(c.message || "Kaydetme başarısız")
        } finally {
            z(!1)
        }
    }, we = d => {
        v({
            ...r,
            parentId: d.id
        }), j(!1), f("")
    }, Se = () => {
        if (!r.parentId) return "Ana Hesap (Üst hesap yok)";
        const d = x.find(c => c.id === r.parentId);
        return d ? `${d.code} - ${d.name}` : "Seçilmedi"
    }, Q = () => {
        const d = b.toLowerCase();
        return d ? x.filter(c => c.code.toLowerCase().includes(d) || c.name.toLowerCase().includes(d)) : x.slice(0, 10)
    }, _ = d => ({
        ASSET: "Varlık (Aktif)",
        LIABILITY: "Borç (Pasif)",
        EQUITY: "Özkaynak (Sermaye)",
        REVENUE: "Gelir",
        EXPENSE: "Gider"
    })[d] || d;
    return a ? e.jsx("div", {
        className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
        children: e.jsxs("div", {
            className: "bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto",
            children: [e.jsx("div", {
                className: "border-b border-neutral-200 p-6 sticky top-0 bg-white z-10",
                children: e.jsxs("div", {
                    className: "flex justify-between items-center",
                    children: [e.jsxs("div", {
                        children: [e.jsx("h3", {
                            className: `${(L=(ke=s)==null?void 0:ke.typography)==null?void 0:L.heading.h3} ${(X=(Ne=s)==null?void 0:Ne.colors)==null?void 0:X.text.primary}`,
                            children: n ? "Hesap Düzenle" : "Yeni Hesap Ekle"
                        }), e.jsx("p", {
                            className: `${(J=(Z=s)==null?void 0:Z.typography)==null?void 0:J.body.sm} ${(ee=(W=s)==null?void 0:W.colors)==null?void 0:ee.text.secondary} mt-1`,
                            children: "Muhasebe hesap planına hesap ekleyin veya düzenleyin"
                        })]
                    }), e.jsx("button", {
                        onClick: y,
                        className: "text-neutral-400 hover:text-neutral-600 transition-colors",
                        children: e.jsx(oa, {
                            className: "w-6 h-6"
                        })
                    })]
                })
            }), e.jsxs("form", {
                onSubmit: T,
                className: "p-6 space-y-6",
                children: [e.jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    children: [e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: `block ${(ae=(se=s)==null?void 0:se.typography)==null?void 0:ae.label.md} ${(re=(te=s)==null?void 0:te.colors)==null?void 0:re.text.primary} mb-2`,
                            children: ["Hesap Kodu ", e.jsx("span", {
                                className: "text-neutral-900",
                                children: "*"
                            })]
                        }), e.jsx("input", {
                            type: "text",
                            value: r.code,
                            onChange: d => v({
                                ...r,
                                code: d.target.value
                            }),
                            placeholder: "Örn: 100 veya 100.01 veya 100.01.01",
                            className: "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 font-mono",
                            required: !0
                        }), e.jsx("p", {
                            className: "text-xs text-neutral-500 mt-1",
                            children: "Format: 3 basamak (100) veya 100.01 veya 100.01.01"
                        })]
                    }), e.jsxs("div", {
                        children: [e.jsxs("label", {
                            className: `block ${(le=(H=s)==null?void 0:H.typography)==null?void 0:le.label.md} ${(V=(M=s)==null?void 0:M.colors)==null?void 0:V.text.primary} mb-2`,
                            children: ["Hesap Tipi ", e.jsx("span", {
                                className: "text-neutral-900",
                                children: "*"
                            })]
                        }), e.jsxs("select", {
                            value: r.type,
                            onChange: d => v({
                                ...r,
                                type: d.target.value
                            }),
                            className: "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500",
                            required: !0,
                            children: [e.jsx("option", {
                                value: "ASSET",
                                children: _("ASSET")
                            }), e.jsx("option", {
                                value: "LIABILITY",
                                children: _("LIABILITY")
                            }), e.jsx("option", {
                                value: "EQUITY",
                                children: _("EQUITY")
                            }), e.jsx("option", {
                                value: "REVENUE",
                                children: _("REVENUE")
                            }), e.jsx("option", {
                                value: "EXPENSE",
                                children: _("EXPENSE")
                            })]
                        })]
                    })]
                }), e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(B=(ne=s)==null?void 0:ne.typography)==null?void 0:B.label.md} ${(ce=(R=s)==null?void 0:R.colors)==null?void 0:ce.text.primary} mb-2`,
                        children: ["Hesap Adı ", e.jsx("span", {
                            className: "text-neutral-900",
                            children: "*"
                        })]
                    }), e.jsx("input", {
                        type: "text",
                        value: r.name,
                        onChange: d => v({
                            ...r,
                            name: d.target.value
                        }),
                        placeholder: "Örn: Kasa, Banka, Müşteriler",
                        className: "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500",
                        required: !0
                    })]
                }), e.jsxs("div", {
                    className: "relative",
                    children: [e.jsx("label", {
                        className: `block ${(G=(F=s)==null?void 0:F.typography)==null?void 0:G.label.md} ${(K=(ie=s)==null?void 0:ie.colors)==null?void 0:K.text.primary} mb-2`,
                        children: "Üst Hesap (Parent Account)"
                    }), e.jsxs("div", {
                        className: "relative",
                        children: [e.jsx("input", {
                            type: "text",
                            value: r.parentId ? Se() : b,
                            onChange: d => {
                                f(d.target.value), r.parentId && v({
                                    ...r,
                                    parentId: null
                                }), j(!0)
                            },
                            onFocus: () => j(!0),
                            placeholder: "Üst hesap ara veya boş bırak (ana hesap)",
                            className: "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 pr-8"
                        }), e.jsx(ma, {
                            className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4"
                        })]
                    }), r.parentId && e.jsx("button", {
                        type: "button",
                        onClick: () => v({
                            ...r,
                            parentId: null
                        }),
                        className: "text-sm text-neutral-900 hover:text-neutral-700 mt-1",
                        children: "Üst hesabı kaldır (ana hesap yap)"
                    }), E && !r.parentId && e.jsxs("div", {
                        className: "absolute z-20 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto",
                        children: [e.jsxs("button", {
                            type: "button",
                            onClick: () => {
                                v({
                                    ...r,
                                    parentId: null
                                }), j(!1)
                            },
                            className: "w-full px-4 py-2 text-left hover:bg-neutral-100 transition-colors border-b",
                            children: [e.jsx("div", {
                                className: "font-medium text-neutral-700",
                                children: "Ana Hesap (Üst hesap yok)"
                            }), e.jsx("div", {
                                className: "text-sm text-neutral-500",
                                children: "En üst seviyede hesap oluştur"
                            })]
                        }), h ? e.jsx("div", {
                            className: "p-4 text-center text-neutral-500",
                            children: "Yükleniyor..."
                        }) : Q().length === 0 ? e.jsx("div", {
                            className: "p-4 text-center text-neutral-500",
                            children: "Hesap bulunamadı"
                        }) : Q().map(d => e.jsxs("button", {
                            type: "button",
                            onClick: () => we(d),
                            className: "w-full px-4 py-2 text-left hover:bg-neutral-100 transition-colors",
                            children: [e.jsx("div", {
                                className: "font-mono text-sm text-neutral-700",
                                children: d.code
                            }), e.jsx("div", {
                                className: "text-sm text-neutral-600",
                                children: d.name
                            })]
                        }, d.id))]
                    }), e.jsx("p", {
                        className: "text-xs text-neutral-500 mt-1",
                        children: "Alt hesap oluşturmak için bir üst hesap seçin. Boş bırakırsanız ana hesap olur."
                    })]
                }), e.jsxs("div", {
                    children: [e.jsx("label", {
                        className: `block ${(de=(oe=s)==null?void 0:oe.typography)==null?void 0:de.label.md} ${(xe=(me=s)==null?void 0:me.colors)==null?void 0:xe.text.primary} mb-2`,
                        children: "Açıklama"
                    }), e.jsx("textarea", {
                        value: r.description,
                        onChange: d => v({
                            ...r,
                            description: d.target.value
                        }),
                        placeholder: "Hesap hakkında ek bilgi...",
                        className: "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500",
                        rows: 3
                    })]
                }), e.jsxs("div", {
                    className: "flex items-center gap-3 p-4 bg-neutral-50 rounded-lg",
                    children: [e.jsx("input", {
                        type: "checkbox",
                        id: "isActive",
                        checked: r.isActive,
                        onChange: d => v({
                            ...r,
                            isActive: d.target.checked
                        }),
                        className: "w-5 h-5 text-neutral-900 rounded focus:ring-2 focus:ring-neutral-500"
                    }), e.jsx("label", {
                        htmlFor: "isActive",
                        className: `${(he=(ue=s)==null?void 0:ue.typography)==null?void 0:he.body.md} ${(ye=(pe=s)==null?void 0:pe.colors)==null?void 0:ye.text.primary} cursor-pointer`,
                        children: "Hesap Aktif"
                    }), e.jsx("span", {
                        className: "text-sm text-neutral-500",
                        children: "(Pasif hesaplar yeni işlemlerde kullanılamaz)"
                    })]
                }), e.jsxs("div", {
                    className: "bg-neutral-50 border border-neutral-200 rounded-lg p-4",
                    children: [e.jsx("h4", {
                        className: "font-semibold text-neutral-900 mb-2",
                        children: "💡 Hesap Planı Hiyerarşisi"
                    }), e.jsxs("ul", {
                        className: "text-sm text-neutral-800 space-y-1",
                        children: [e.jsxs("li", {
                            children: ["• ", e.jsx("strong", {
                                children: "1xx:"
                            }), " Varlık Hesapları (Dönen/Duran Varlıklar)"]
                        }), e.jsxs("li", {
                            children: ["• ", e.jsx("strong", {
                                children: "2xx:"
                            }), " Borç Hesapları (Kısa/Uzun Vadeli Yükümlülükler)"]
                        }), e.jsxs("li", {
                            children: ["• ", e.jsx("strong", {
                                children: "3xx:"
                            }), " Özkaynak Hesapları (Sermaye, Yedekler)"]
                        }), e.jsxs("li", {
                            children: ["• ", e.jsx("strong", {
                                children: "6xx:"
                            }), " Gelir Hesapları (Satış, Faiz Gelirleri)"]
                        }), e.jsxs("li", {
                            children: ["• ", e.jsx("strong", {
                                children: "7xx:"
                            }), " Gider Hesapları (Maliyet, İşletme Giderleri)"]
                        })]
                    })]
                }), e.jsxs("div", {
                    className: "flex justify-end gap-3 pt-4 border-t border-neutral-200",
                    children: [e.jsx("button", {
                        type: "button",
                        onClick: y,
                        className: P("secondary", "md", "md"),
                        disabled: C,
                        children: "İptal"
                    }), e.jsx("button", {
                        type: "submit",
                        className: P("primary", "md", "md"),
                        disabled: C,
                        children: C ? e.jsxs(e.Fragment, {
                            children: [e.jsx("div", {
                                className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                            }), "Kaydediliyor..."]
                        }) : e.jsxs(e.Fragment, {
                            children: [e.jsx($a, {
                                className: "w-4 h-4"
                            }), n ? "Güncelle" : "Kaydet"]
                        })
                    })]
                })]
            })]
        })
    }) : null
}

function Ka() {
    var X, Z, J, W, ee, se, ae, te, re, H, le, M, V, ne, B, R, ce, F, G, ie, K, oe, de, me, xe, ue, he, pe, ye, d, c, $, k, u, U, $e, je, m, Ce, ge, ze, w, Te, He, ns, cs;
    const [a, y] = t.useState([]), [l, n] = t.useState(!1), [r, v] = t.useState(""), [x, D] = t.useState("ALL"), [h, q] = t.useState(new Set), [C, z] = t.useState(!1), [b, f] = t.useState(null);
    t.useEffect(() => {
        E()
    }, [x]);
    const E = async () => {
        try {
            n(!0);
            const o = new URLSearchParams;
            x !== "ALL" && o.append("type", x);
            const A = await fetch(`/api/accounting/chart-of-accounts?${o}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!A.ok) throw new Error("Failed to load accounts");
            const Ee = await A.json();
            y(j(Ee.data || Ee))
        } catch (o) {
            console.error("Failed to load accounts:", o), O.error("Hesap planı yüklenemedi: " + (o.message || "Bilinmeyen hata"))
        } finally {
            n(!1)
        }
    }, j = o => {
        const A = new Map,
            Ee = [];
        o.forEach(ve => {
            A.set(ve.id, {
                ...ve,
                children: []
            })
        }), o.forEach(ve => {
            const Pe = A.get(ve.id);
            if (ve.parentId) {
                const Ye = A.get(ve.parentId);
                Ye ? Ye.children.push(Pe) : Ee.push(Pe)
            } else Ee.push(Pe)
        });
        const Me = (ve, Pe) => ve.code.localeCompare(Pe.code);
        return Ee.sort(Me), Ee.forEach(ve => {
            ve.children && ve.children.sort(Me)
        }), Ee
    }, Y = o => {
        const A = new Set(h);
        A.has(o) ? A.delete(o) : A.add(o), q(A)
    }, T = async o => {
        if (confirm("Bu hesabı silmek istediğinize emin misiniz?")) try {
            if (!(await fetch(`/api/accounting/chart-of-accounts/${o}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                })).ok) throw new Error("Failed to delete account");
            O.success("Hesap silindi"), E()
        } catch (A) {
            O.error("Hesap silinemedi: " + (A.message || "Bilinmeyen hata"))
        }
    }, we = o => ({
        ASSET: "Varlık",
        LIABILITY: "Borç",
        EQUITY: "Özkaynak",
        REVENUE: "Gelir",
        EXPENSE: "Gider"
    })[o] || o, Se = o => {
        const Ee = {
            ASSET: {
                color: "bg-neutral-100 text-neutral-800"
            },
            LIABILITY: {
                color: "bg-neutral-100 text-neutral-800"
            },
            EQUITY: {
                color: "bg-neutral-100 text-neutral-800"
            },
            REVENUE: {
                color: "bg-neutral-100 text-neutral-800"
            },
            EXPENSE: {
                color: "bg-neutral-100 text-neutral-800"
            }
        } [o] || {
            color: "bg-neutral-100 text-neutral-700"
        };
        return e.jsx("span", {
            className: `px-2 py-1 rounded-full text-xs font-medium ${Ee.color}`,
            children: we(o)
        })
    }, Q = o => new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY"
    }).format(o), _ = (o, A = 0) => {
        var Pe, Ye, is, Je, We, Ke, os, es, Ae, Ue;
        const Ee = o.children && o.children.length > 0,
            Me = h.has(o.id);
        return !(o.code.toLowerCase().includes(r.toLowerCase()) || o.name.toLowerCase().includes(r.toLowerCase())) && r ? null : e.jsxs(wa.Fragment, {
            children: [e.jsxs("tr", {
                className: "hover:bg-neutral-50 transition-colors",
                children: [e.jsx("td", {
                    className: "px-6 py-4 whitespace-nowrap",
                    children: e.jsxs("div", {
                        className: "flex items-center",
                        style: {
                            paddingLeft: `${A*24}px`
                        },
                        children: [Ee ? e.jsx("button", {
                            onClick: () => Y(o.id),
                            className: "mr-2 text-neutral-400 hover:text-neutral-600",
                            children: Me ? e.jsx(ss, {
                                className: "w-4 h-4"
                            }) : e.jsx(as, {
                                className: "w-4 h-4"
                            })
                        }) : e.jsx("span", {
                            className: "mr-2 w-4"
                        }), e.jsx(fs, {
                            className: "w-4 h-4 text-neutral-400 mr-2"
                        }), e.jsx("span", {
                            className: `${(Ye=(Pe=s)==null?void 0:Pe.typography)==null?void 0:Ye.body.sm} font-mono font-medium ${(Je=(is=s)==null?void 0:is.colors)==null?void 0:Je.text.primary}`,
                            children: o.code
                        })]
                    })
                }), e.jsx("td", {
                    className: "px-6 py-4",
                    children: e.jsxs("div", {
                        children: [e.jsx("p", {
                            className: `${(Ke=(We=s)==null?void 0:We.typography)==null?void 0:Ke.body.sm} ${(es=(os=s)==null?void 0:os.colors)==null?void 0:es.text.primary} font-medium`,
                            children: o.name
                        }), !o.isActive && e.jsx("span", {
                            className: "text-xs text-neutral-400",
                            children: "(Pasif)"
                        })]
                    })
                }), e.jsx("td", {
                    className: "px-6 py-4 whitespace-nowrap text-center",
                    children: Se(o.type)
                }), e.jsx("td", {
                    className: "px-6 py-4 whitespace-nowrap text-right",
                    children: e.jsx("span", {
                        className: `${(Ue=(Ae=s)==null?void 0:Ae.typography)==null?void 0:Ue.body.sm} font-medium text-neutral-900`,
                        children: Q(o.balance)
                    })
                }), e.jsx("td", {
                    className: "px-6 py-4 whitespace-nowrap text-right",
                    children: e.jsxs("div", {
                        className: "flex items-center justify-end gap-2",
                        children: [e.jsx("button", {
                            onClick: () => O.success("Detay görüntüleme özelliği yakında eklenecek"),
                            className: "p-2 text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors",
                            title: "Detayları Görüntüle",
                            children: e.jsx(js, {
                                className: "w-4 h-4"
                            })
                        }), e.jsx("button", {
                            onClick: () => {
                                f(o), z(!0)
                            },
                            className: "p-2 text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors",
                            title: "Düzenle",
                            children: e.jsx(Ns, {
                                className: "w-4 h-4"
                            })
                        }), e.jsx("button", {
                            onClick: () => T(o.id),
                            className: "p-2 text-neutral-800 hover:bg-neutral-50 rounded-lg transition-colors",
                            title: "Sil",
                            children: e.jsx(vs, {
                                className: "w-4 h-4"
                            })
                        })]
                    })
                })]
            }), Ee && Me && o.children.map(_e => _(_e, A + 1))]
        }, o.id)
    }, L = (o => {
        const A = [],
            Ee = Me => {
                Me.forEach(ve => {
                    A.push(ve), ve.children && ve.children.length > 0 && Ee(ve.children)
                })
            };
        return Ee(o), A
    })(a), Ne = L.reduce((o, A) => o + A.balance, 0);
    return e.jsxs("div", {
        className: "space-y-6",
        children: [e.jsxs("div", {
            className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
            children: [e.jsxs("div", {
                children: [e.jsx("h2", {
                    className: `${(Z=(X=s)==null?void 0:X.typography)==null?void 0:Z.heading.h2} ${(W=(J=s)==null?void 0:J.colors)==null?void 0:W.text.primary}`,
                    children: "Hesap Planı Yönetimi"
                }), e.jsx("p", {
                    className: `${(se=(ee=s)==null?void 0:ee.typography)==null?void 0:se.body.sm} ${(te=(ae=s)==null?void 0:ae.colors)==null?void 0:te.text.secondary} mt-1`,
                    children: "Muhasebe hesaplarını görüntüleyin ve yönetin"
                })]
            }), e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [e.jsxs("button", {
                    className: P("secondary", "md", "md"),
                    onClick: () => {
                        try {
                            Ra(L), O.success("Hesap planı Excel olarak indirildi")
                        } catch {
                            O.error("Excel export başarısız oldu")
                        }
                    },
                    children: [e.jsx(Ze, {
                        className: "w-4 h-4"
                    }), "Excel İndir"]
                }), e.jsxs("button", {
                    className: P("primary", "md", "md"),
                    onClick: () => {
                        f(null), z(!0)
                    },
                    children: [e.jsx(Ca, {
                        className: "w-4 h-4"
                    }), "Yeni Hesap"]
                })]
            })]
        }), e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-4 gap-4",
            children: [e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-2",
                    children: e.jsx(fs, {
                        className: "w-8 h-8 text-neutral-900"
                    })
                }), e.jsx("p", {
                    className: `${(H=(re=s)==null?void 0:re.typography)==null?void 0:H.stat.md} ${(M=(le=s)==null?void 0:le.colors)==null?void 0:M.text.primary}`,
                    children: L.length
                }), e.jsx("p", {
                    className: `${(ne=(V=s)==null?void 0:V.typography)==null?void 0:ne.body.sm} ${(R=(B=s)==null?void 0:B.colors)==null?void 0:R.text.secondary}`,
                    children: "Toplam Hesap"
                })]
            }), e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-2",
                    children: e.jsx(Fe, {
                        className: "w-8 h-8 text-neutral-900"
                    })
                }), e.jsx("p", {
                    className: `${(F=(ce=s)==null?void 0:ce.typography)==null?void 0:F.stat.md} ${(ie=(G=s)==null?void 0:G.colors)==null?void 0:ie.text.primary}`,
                    children: L.filter(o => o.balance > 0).length
                }), e.jsx("p", {
                    className: `${(oe=(K=s)==null?void 0:K.typography)==null?void 0:oe.body.sm} ${(me=(de=s)==null?void 0:de.colors)==null?void 0:me.text.secondary}`,
                    children: "Pozitif Bakiye"
                })]
            }), e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-2",
                    children: e.jsx(Oe, {
                        className: "w-8 h-8 text-neutral-800"
                    })
                }), e.jsx("p", {
                    className: `${(ue=(xe=s)==null?void 0:xe.typography)==null?void 0:ue.stat.md} ${(pe=(he=s)==null?void 0:he.colors)==null?void 0:pe.text.primary}`,
                    children: L.filter(o => o.balance < 0).length
                }), e.jsx("p", {
                    className: `${(d=(ye=s)==null?void 0:ye.typography)==null?void 0:d.body.sm} ${($=(c=s)==null?void 0:c.colors)==null?void 0:$.text.secondary}`,
                    children: "Negatif Bakiye"
                })]
            }), e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-2",
                    children: e.jsx(ts, {
                        className: "w-8 h-8 text-neutral-900"
                    })
                }), e.jsx("p", {
                    className: `${(u=(k=s)==null?void 0:k.typography)==null?void 0:u.stat.md} text-neutral-900`,
                    children: Q(Ne)
                }), e.jsx("p", {
                    className: `${($e=(U=s)==null?void 0:U.typography)==null?void 0:$e.body.sm} ${(m=(je=s)==null?void 0:je.colors)==null?void 0:m.text.secondary}`,
                    children: "Net Bakiye"
                })]
            })]
        }), e.jsxs("div", {
            className: p("md", "md", "default", "lg"),
            children: [e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [e.jsxs("div", {
                    className: "relative md:col-span-2",
                    children: [e.jsx(ma, {
                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4"
                    }), e.jsx("input", {
                        type: "text",
                        placeholder: "Hesap kodu veya adı ara...",
                        value: r,
                        onChange: o => v(o.target.value),
                        className: "w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
                    })]
                }), e.jsxs("select", {
                    value: x,
                    onChange: o => D(o.target.value),
                    className: "px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500",
                    children: [e.jsx("option", {
                        value: "ALL",
                        children: "Tüm Hesap Tipleri"
                    }), e.jsx("option", {
                        value: "ASSET",
                        children: "Varlık"
                    }), e.jsx("option", {
                        value: "LIABILITY",
                        children: "Borç"
                    }), e.jsx("option", {
                        value: "EQUITY",
                        children: "Özkaynak"
                    }), e.jsx("option", {
                        value: "REVENUE",
                        children: "Gelir"
                    }), e.jsx("option", {
                        value: "EXPENSE",
                        children: "Gider"
                    })]
                })]
            }), e.jsxs("div", {
                className: "flex items-center gap-2 mt-4",
                children: [e.jsxs("button", {
                    onClick: E,
                    className: P("secondary", "sm", "md"),
                    children: [e.jsx(ls, {
                        className: "w-4 h-4"
                    }), "Yenile"]
                }), e.jsx("button", {
                    onClick: () => {
                        const o = new Set(L.map(A => A.id));
                        q(o)
                    },
                    className: P("secondary", "sm", "md"),
                    children: "Tümünü Aç"
                }), e.jsx("button", {
                    onClick: () => q(new Set),
                    className: P("secondary", "sm", "md"),
                    children: "Tümünü Kapat"
                }), e.jsxs("button", {
                    onClick: () => O.success("Excel export özelliği yakında eklenecek"),
                    className: P("secondary", "sm", "md"),
                    children: [e.jsx(Ze, {
                        className: "w-4 h-4"
                    }), "Excel İndir"]
                })]
            })]
        }), e.jsx("div", {
            className: p("none", "none", "default", "lg"),
            children: l ? e.jsx("div", {
                className: "flex items-center justify-center h-64",
                children: e.jsx("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"
                })
            }) : a.length === 0 ? e.jsxs("div", {
                className: "flex flex-col items-center justify-center h-64 text-center p-6",
                children: [e.jsx(fs, {
                    className: "w-16 h-16 text-neutral-300 mb-4"
                }), e.jsx("p", {
                    className: `${(ge=(Ce=s)==null?void 0:Ce.typography)==null?void 0:ge.body.lg} ${(w=(ze=s)==null?void 0:ze.colors)==null?void 0:w.text.primary} mb-2`,
                    children: "Hesap Bulunamadı"
                }), e.jsx("p", {
                    className: `${(He=(Te=s)==null?void 0:Te.typography)==null?void 0:He.body.sm} ${(cs=(ns=s)==null?void 0:ns.colors)==null?void 0:cs.text.tertiary}`,
                    children: "Henüz hesap eklenmemiş"
                })]
            }) : e.jsx("div", {
                className: "overflow-x-auto",
                children: e.jsxs("table", {
                    className: "w-full",
                    children: [e.jsx("thead", {
                        className: "bg-neutral-50 border-b-2 border-neutral-200",
                        children: e.jsxs("tr", {
                            children: [e.jsx("th", {
                                className: "px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider",
                                children: "Hesap Kodu"
                            }), e.jsx("th", {
                                className: "px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider",
                                children: "Hesap Adı"
                            }), e.jsx("th", {
                                className: "px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider",
                                children: "Tip"
                            }), e.jsx("th", {
                                className: "px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider",
                                children: "Bakiye"
                            }), e.jsx("th", {
                                className: "px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider",
                                children: "İşlemler"
                            })]
                        })
                    }), e.jsx("tbody", {
                        className: "bg-white divide-y divide-gray-200",
                        children: a.map(o => _(o, 0))
                    })]
                })
            })
        }), e.jsx(Ga, {
            open: C,
            onClose: () => {
                z(!1), f(null)
            },
            onSaved: () => {
                E(), z(!1), f(null)
            },
            initialData: b
        })]
    })
}
const qe = "px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50",
    Qe = "px-6 py-4 text-sm text-neutral-900";

function Ua() {
    var Q, _, ke, L, Ne, X, Z, J, W, ee, se, ae, te, re, H, le, M, V, ne, B, R, ce, F, G, ie, K, oe, de, me, xe, ue, he, pe, ye, d, c, $, k, u, U, $e, je;
    const [a, y] = t.useState([]), [l, n] = t.useState({
        totalDebit: 0,
        totalCredit: 0,
        difference: 0,
        isBalanced: !0
    }), [r, v] = t.useState(!1), [x, D] = t.useState(""), [h, q] = t.useState(new Date().toISOString().split("T")[0]), [C, z] = t.useState("ALL"), [b, f] = t.useState(!1);
    t.useEffect(() => {
        E()
    }, [x, h, C, b]);
    const E = async () => {
        try {
            v(!0);
            const m = new URLSearchParams;
            x && m.append("startDate", x), h && m.append("endDate", h), C !== "ALL" && m.append("accountType", C), m.append("includeZeroBalance", b.toString());
            const Ce = await fetch(`/api/accounting/reports/trial-balance?${m}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!Ce.ok) throw new Error("Failed to load trial balance");
            const ge = await Ce.json();
            y(ge.items || []), n(ge.summary || {
                totalDebit: 0,
                totalCredit: 0,
                difference: 0,
                isBalanced: !0
            })
        } catch (m) {
            console.error("Failed to load trial balance:", m), O.error("Mizan raporu yï¿½klenemedi")
        } finally {
            v(!1)
        }
    }, j = () => {
        try {
            Fa(a, l, {
                from: x,
                to: h
            }), O.success("Mizan raporu Excel olarak indirildi")
        } catch {
            O.error("Excel export baï¿½arï¿½sï¿½z oldu")
        }
    }, Y = () => {
        window.print()
    }, T = m => new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY"
    }).format(m), we = m => ({
        ASSET: "text-neutral-900",
        LIABILITY: "text-neutral-900",
        EQUITY: "text-neutral-900",
        REVENUE: "text-neutral-900",
        EXPENSE: "text-orange-600"
    })[m] || "text-neutral-600", Se = m => ({
        ASSET: "Varlï¿½k",
        LIABILITY: "Borï¿½",
        EQUITY: "ï¿½zkaynak",
        REVENUE: "Gelir",
        EXPENSE: "Gider"
    })[m] || m;
    return e.jsxs("div", {
        className: "space-y-6 max-w-7xl mx-auto",
        children: [e.jsxs("div", {
            className: "flex justify-end items-center gap-2",
            children: [e.jsxs("button", {
                onClick: E,
                className: I(P("md", "outline", "lg"), "gap-2"),
                children: [e.jsx(ls, {
                    className: "w-4 h-4"
                }), "Yenile"]
            }), e.jsxs("button", {
                onClick: Y,
                className: I(P("md", "outline", "lg"), "gap-2"),
                children: [e.jsx(js, {
                    className: "w-4 h-4"
                }), "Yazdır"]
            }), e.jsxs("button", {
                onClick: j,
                className: I(P("md", "primary", "lg"), "gap-2"),
                children: [e.jsx(Ze, {
                    className: "w-4 h-4"
                }), "Excel İndir"]
            })]
        }), e.jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
            children: [e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(Fe, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(_=(Q=s)==null?void 0:Q.typography)==null?void 0:_.stat.lg} text-neutral-900 mb-1`,
                    children: T(l.totalDebit)
                }), e.jsx("p", {
                    className: `${(L=(ke=s)==null?void 0:ke.typography)==null?void 0:L.body.sm} ${(X=(Ne=s)==null?void 0:Ne.colors)==null?void 0:X.text.secondary}`,
                    children: "Toplam Borç"
                })]
            }), e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(Oe, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(J=(Z=s)==null?void 0:Z.typography)==null?void 0:J.stat.lg} text-neutral-900 mb-1`,
                    children: T(l.totalCredit)
                }), e.jsx("p", {
                    className: `${(ee=(W=s)==null?void 0:W.typography)==null?void 0:ee.body.sm} ${(ae=(se=s)==null?void 0:se.colors)==null?void 0:ae.text.secondary}`,
                    children: "Toplam Alacak"
                })]
            }), e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(ts, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(re=(te=s)==null?void 0:te.typography)==null?void 0:re.stat.lg} ${l.difference===0,"text-neutral-900"} mb-1`,
                    children: T(Math.abs(l.difference))
                }), e.jsx("p", {
                    className: `${(le=(H=s)==null?void 0:H.typography)==null?void 0:le.body.sm} ${(V=(M=s)==null?void 0:M.colors)==null?void 0:V.text.secondary}`,
                    children: "Fark"
                })]
            }), e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(ps, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(B=(ne=s)==null?void 0:ne.typography)==null?void 0:B.stat.lg} ${l.isBalanced,"text-neutral-900"} mb-1`,
                    children: (l.isBalanced, "?")
                }), e.jsx("p", {
                    className: `${(ce=(R=s)==null?void 0:R.typography)==null?void 0:ce.body.sm} ${(G=(F=s)==null?void 0:F.colors)==null?void 0:G.text.secondary}`,
                    children: l.isBalanced ? "Dengede" : "Dengesiz"
                })]
            })]
        }), e.jsx("div", {
            className: p("md", "md", "default", "lg"),
            children: e.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
                children: [e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(K=(ie=s)==null?void 0:ie.typography)==null?void 0:K.label.sm} ${(de=(oe=s)==null?void 0:oe.colors)==null?void 0:de.text.primary} mb-1`,
                        children: [e.jsx(rs, {
                            className: "w-4 h-4 inline mr-1"
                        }), "Baï¿½langï¿½ï¿½ Tarihi"]
                    }), e.jsx("input", {
                        type: "date",
                        value: x,
                        onChange: m => D(m.target.value),
                        className: "w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
                    })]
                }), e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(xe=(me=s)==null?void 0:me.typography)==null?void 0:xe.label.sm} ${(he=(ue=s)==null?void 0:ue.colors)==null?void 0:he.text.primary} mb-1`,
                        children: [e.jsx(rs, {
                            className: "w-4 h-4 inline mr-1"
                        }), "Bitiï¿½ Tarihi"]
                    }), e.jsx("input", {
                        type: "date",
                        value: h,
                        onChange: m => q(m.target.value),
                        className: "w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
                    })]
                }), e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(ye=(pe=s)==null?void 0:pe.typography)==null?void 0:ye.label.sm} ${(c=(d=s)==null?void 0:d.colors)==null?void 0:c.text.primary} mb-1`,
                        children: [e.jsx(Ta, {
                            className: "w-4 h-4 inline mr-1"
                        }), "Hesap Tipi"]
                    }), e.jsxs("select", {
                        value: C,
                        onChange: m => z(m.target.value),
                        className: be("md", "default", void 0, "lg"),
                        children: [e.jsx("option", {
                            value: "ALL",
                            children: "Tï¿½mï¿½"
                        }), e.jsx("option", {
                            value: "ASSET",
                            children: "Varlï¿½k"
                        }), e.jsx("option", {
                            value: "LIABILITY",
                            children: "Borï¿½"
                        }), e.jsx("option", {
                            value: "EQUITY",
                            children: "ï¿½zkaynak"
                        }), e.jsx("option", {
                            value: "REVENUE",
                            children: "Gelir"
                        }), e.jsx("option", {
                            value: "EXPENSE",
                            children: "Gider"
                        })]
                    })]
                }), e.jsx("div", {
                    className: "flex items-end",
                    children: e.jsxs("label", {
                        className: "flex items-center gap-2 cursor-pointer",
                        children: [e.jsx("input", {
                            type: "checkbox",
                            checked: b,
                            onChange: m => f(m.target.checked),
                            className: "w-4 h-4 text-neutral-900 rounded focus:ring-2 focus:ring-neutral-500"
                        }), e.jsx("span", {
                            className: `${(k=($=s)==null?void 0:$.typography)==null?void 0:k.body.sm}`,
                            children: "Sï¿½fï¿½r bakiye gï¿½ster"
                        })]
                    })
                })]
            })
        }), e.jsxs("div", {
            className: p("md", "md", "default", "lg"),
            children: [e.jsxs("div", {
                className: "flex justify-between items-center mb-4",
                children: [e.jsx("h3", {
                    className: `${(U=(u=s)==null?void 0:u.typography)==null?void 0:U.heading.h4} ${(je=($e=s)==null?void 0:$e.colors)==null?void 0:je.text.primary}`,
                    children: "Hesap Detaylarï¿½"
                }), e.jsxs("div", {
                    className: "flex items-center gap-2 text-sm text-neutral-600",
                    children: [e.jsx(Aa, {
                        className: "w-4 h-4"
                    }), e.jsxs("span", {
                        children: [a.length, " hesap"]
                    })]
                })]
            }), r ? e.jsx("div", {
                className: "flex items-center justify-center h-32",
                children: e.jsx("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"
                })
            }) : a.length === 0 ? e.jsxs("div", {
                className: "text-center py-12 text-neutral-500",
                children: [e.jsx(ps, {
                    className: "w-12 h-12 mx-auto mb-3 opacity-50"
                }), e.jsx("p", {
                    children: "Seï¿½ilen kriterlere uygun kayï¿½t bulunamadï¿½"
                })]
            }) : e.jsx("div", {
                className: "overflow-x-auto",
                children: e.jsxs("table", {
                    className: "min-w-full w-full",
                    children: [e.jsx("thead", {
                        children: e.jsxs("tr", {
                            children: [e.jsx("th", {
                                className: qe,
                                children: "Hesap Kodu"
                            }), e.jsx("th", {
                                className: qe,
                                children: "Hesap Adï¿½"
                            }), e.jsx("th", {
                                className: `${qe} text-center`,
                                children: "Tip"
                            }), e.jsx("th", {
                                className: `${qe} text-right`,
                                children: "Borï¿½"
                            }), e.jsx("th", {
                                className: `${qe} text-right`,
                                children: "Alacak"
                            }), e.jsx("th", {
                                className: `${qe} text-right`,
                                children: "Bakiye"
                            })]
                        })
                    }), e.jsx("tbody", {
                        children: a.map((m, Ce) => {
                            const ge = m.debit - m.credit;
                            return e.jsxs("tr", {
                                className: "hover:bg-neutral-50 transition-colors",
                                children: [e.jsx("td", {
                                    className: Qe,
                                    children: e.jsx("span", {
                                        className: "font-mono text-sm font-medium text-neutral-900",
                                        children: m.accountCode
                                    })
                                }), e.jsx("td", {
                                    className: Qe,
                                    children: e.jsx("p", {
                                        className: "text-sm text-neutral-900 font-medium",
                                        children: m.accountName
                                    })
                                }), e.jsx("td", {
                                    className: `${Qe} text-center`,
                                    children: e.jsx("span", {
                                        className: `text-xs font-medium ${we(m.accountType)}`,
                                        children: Se(m.accountType)
                                    })
                                }), e.jsx("td", {
                                    className: `${Qe} text-right`,
                                    children: e.jsx("span", {
                                        className: "text-sm text-neutral-900 font-medium",
                                        children: m.debit > 0 ? T(m.debit) : "-"
                                    })
                                }), e.jsx("td", {
                                    className: `${Qe} text-right`,
                                    children: e.jsx("span", {
                                        className: "text-sm text-neutral-900 font-medium",
                                        children: m.credit > 0 ? T(m.credit) : "-"
                                    })
                                }), e.jsx("td", {
                                    className: `${Qe} text-right`,
                                    children: e.jsxs("span", {
                                        className: `text-sm font-bold ${ge>0||ge<0?"text-neutral-900":"text-neutral-600"}`,
                                        children: [T(Math.abs(ge)), ge > 0 ? " B" : ge < 0 ? " A" : ""]
                                    })
                                })]
                            }, Ce)
                        })
                    }), e.jsx("tfoot", {
                        className: "bg-neutral-100 border-t-2 border-neutral-300",
                        children: e.jsxs("tr", {
                            className: "font-bold",
                            children: [e.jsx("td", {
                                colSpan: 3,
                                className: "px-4 py-3 text-right text-sm",
                                children: "TOPLAM:"
                            }), e.jsx("td", {
                                className: "px-4 py-3 text-right text-neutral-900",
                                children: T(l.totalDebit)
                            }), e.jsx("td", {
                                className: "px-4 py-3 text-right text-neutral-900",
                                children: T(l.totalCredit)
                            }), e.jsx("td", {
                                className: "px-4 py-3 text-right",
                                children: e.jsx("span", {
                                    className: (l.difference === 0, "text-neutral-900"),
                                    children: l.isBalanced ? "? Dengede" : "? Dengesiz"
                                })
                            })]
                        })
                    })]
                })
            })]
        }), !l.isBalanced && e.jsx("div", {
            className: "bg-neutral-50 border border-red-200 rounded-lg p-4",
            children: e.jsxs("div", {
                className: "flex items-start gap-3",
                children: [e.jsx("div", {
                    className: "flex-shrink-0",
                    children: e.jsx("div", {
                        className: "w-8 h-8 bg-neutral-50 rounded-full flex items-center justify-center",
                        children: e.jsx("span", {
                            className: "text-neutral-900 text-lg font-bold",
                            children: "!"
                        })
                    })
                }), e.jsxs("div", {
                    className: "flex-1",
                    children: [e.jsx("h4", {
                        className: "text-neutral-900 font-semibold mb-1",
                        children: "Mizan Dengesi Uyuşmuyor"
                    }), e.jsxs("p", {
                        className: "text-neutral-900 text-sm mb-2",
                        children: ["Toplam borç ve alacak tutarları eşit değil. Fark:", " ", T(Math.abs(l.difference))]
                    }), e.jsx("p", {
                        className: "text-neutral-900 text-xs",
                        children: "Lütfen yevmiye kayıtlarınızı kontrol edin. Her kayıtta borç ve alacak toplamları eşit olmalıdır."
                    })]
                })]
            })
        })]
    })
}

function qa() {
    var Y, T, we, Se, Q, _, ke, L, Ne, X, Z, J, W, ee, se, ae, te, re, H, le, M, V, ne, B, R, ce, F, G, ie, K, oe, de, me, xe, ue, he, pe, ye, d, c, $, k, u, U, $e, je, m, Ce, ge, ze;
    const [a, y] = t.useState({
        revenues: [],
        expenses: [],
        summary: {
            totalRevenue: 0,
            totalExpense: 0,
            grossProfit: 0,
            netProfit: 0,
            profitMargin: 0
        }
    }), [l, n] = t.useState(!1), [r, v] = t.useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]), [x, D] = t.useState(new Date().toISOString().split("T")[0]), [h, q] = t.useState("detailed");
    t.useEffect(() => {
        C()
    }, [r, x]);
    const C = async () => {
        try {
            n(!0);
            const w = new URLSearchParams({
                    startDate: r,
                    endDate: x
                }),
                Te = await fetch(`/api/accounting/reports/income-statement?${w}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
            if (!Te.ok) throw new Error("Failed to load income statement");
            const He = await Te.json();
            y(He.data || He)
        } catch (w) {
            console.error("Failed to load income statement:", w), O.error("Gelir-Gider Tablosu yüklenemedi")
        } finally {
            n(!1)
        }
    }, z = () => {
        try {
            Oa(a.revenues, a.expenses, a.summary, {
                from: r,
                to: x
            }), O.success("Gelir-Gider tablosu Excel olarak indirildi")
        } catch {
            O.error("Excel export başarısız oldu")
        }
    }, b = () => {
        window.print()
    }, f = w => new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY"
    }).format(w), E = w => `${w.toFixed(2)}%`, j = a.summary.netProfit >= 0;
    return e.jsxs("div", {
        className: "space-y-6 max-w-7xl mx-auto",
        children: [e.jsxs("div", {
            className: "flex justify-end items-center gap-2",
            children: [e.jsxs("button", {
                onClick: C,
                className: I(P("md", "outline", "lg"), "gap-2"),
                children: [e.jsx(ls, {
                    className: "w-4 h-4"
                }), "Yenile"]
            }), e.jsxs("button", {
                onClick: b,
                className: I(P("md", "outline", "lg"), "gap-2"),
                children: [e.jsx(js, {
                    className: "w-4 h-4"
                }), "Yazdır"]
            }), e.jsxs("button", {
                onClick: z,
                className: I(P("md", "primary", "lg"), "gap-2"),
                children: [e.jsx(Ze, {
                    className: "w-4 h-4"
                }), "Excel İndir"]
            })]
        }), e.jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4",
            children: [e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(Fe, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(T=(Y=s)==null?void 0:Y.typography)==null?void 0:T.stat.lg} text-neutral-900 mb-1`,
                    children: f(a.summary.totalRevenue)
                }), e.jsx("p", {
                    className: `${(Se=(we=s)==null?void 0:we.typography)==null?void 0:Se.body.sm} ${(_=(Q=s)==null?void 0:Q.colors)==null?void 0:_.text.secondary}`,
                    children: "Toplam Gelir"
                })]
            }), e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(Oe, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(L=(ke=s)==null?void 0:ke.typography)==null?void 0:L.stat.lg} text-neutral-900 mb-1`,
                    children: f(a.summary.totalExpense)
                }), e.jsx("p", {
                    className: `${(X=(Ne=s)==null?void 0:Ne.typography)==null?void 0:X.body.sm} ${(J=(Z=s)==null?void 0:Z.colors)==null?void 0:J.text.secondary}`,
                    children: "Toplam Gider"
                })]
            }), e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(ws, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(ee=(W=s)==null?void 0:W.typography)==null?void 0:ee.stat.lg} ${a.summary.grossProfit>=0,"text-neutral-900"} mb-1`,
                    children: f(Math.abs(a.summary.grossProfit))
                }), e.jsx("p", {
                    className: `${(ae=(se=s)==null?void 0:se.typography)==null?void 0:ae.body.sm} ${(re=(te=s)==null?void 0:te.colors)==null?void 0:re.text.secondary}`,
                    children: "Brüt Kar/Zarar"
                })]
            }), e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(ts, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(le=(H=s)==null?void 0:H.typography)==null?void 0:le.stat.lg} text-neutral-900 mb-1`,
                    children: f(Math.abs(a.summary.netProfit))
                }), e.jsx("p", {
                    className: `${(V=(M=s)==null?void 0:M.typography)==null?void 0:V.body.sm} ${(B=(ne=s)==null?void 0:ne.colors)==null?void 0:B.text.secondary}`,
                    children: "Net Kar/Zarar"
                })]
            }), e.jsxs("div", {
                className: p("sm", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("primary"),
                        children: e.jsx(xa, {
                            className: "w-4 h-4 text-white"
                        })
                    })
                }), e.jsx("p", {
                    className: `${(ce=(R=s)==null?void 0:R.typography)==null?void 0:ce.stat.lg} ${a.summary.profitMargin>=0,"text-neutral-900"} mb-1`,
                    children: E(a.summary.profitMargin)
                }), e.jsx("p", {
                    className: `${(G=(F=s)==null?void 0:F.typography)==null?void 0:G.body.sm} ${(K=(ie=s)==null?void 0:ie.colors)==null?void 0:K.text.secondary}`,
                    children: "Kar Marjı"
                })]
            })]
        }), e.jsx("div", {
            className: p("md", "md", "default", "lg"),
            children: e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(de=(oe=s)==null?void 0:oe.typography)==null?void 0:de.label.sm} ${(xe=(me=s)==null?void 0:me.colors)==null?void 0:xe.text.primary} mb-1`,
                        children: [e.jsx(rs, {
                            className: "w-4 h-4 inline mr-1"
                        }), "Başlangıç Tarihi"]
                    }), e.jsx("input", {
                        type: "date",
                        value: r,
                        onChange: w => v(w.target.value),
                        className: be("md", "default", void 0, "lg")
                    })]
                }), e.jsxs("div", {
                    children: [e.jsxs("label", {
                        className: `block ${(he=(ue=s)==null?void 0:ue.typography)==null?void 0:he.label.sm} ${(ye=(pe=s)==null?void 0:pe.colors)==null?void 0:ye.text.primary} mb-1`,
                        children: [e.jsx(rs, {
                            className: "w-4 h-4 inline mr-1"
                        }), "Bitiş Tarihi"]
                    }), e.jsx("input", {
                        type: "date",
                        value: x,
                        onChange: w => D(w.target.value),
                        className: be("md", "default", void 0, "lg")
                    })]
                }), e.jsxs("div", {
                    children: [e.jsx("label", {
                        className: `block ${(c=(d=s)==null?void 0:d.typography)==null?void 0:c.label.sm} ${(k=($=s)==null?void 0:$.colors)==null?void 0:k.text.primary} mb-1`,
                        children: "Görünüm Tipi"
                    }), e.jsxs("select", {
                        value: h,
                        onChange: w => q(w.target.value),
                        className: be("md", "default", void 0, "lg"),
                        children: [e.jsx("option", {
                            value: "detailed",
                            children: "Detaylı"
                        }), e.jsx("option", {
                            value: "summary",
                            children: "Özet"
                        })]
                    })]
                })]
            })
        }), l ? e.jsx("div", {
            className: "flex items-center justify-center h-64",
            children: e.jsx("div", {
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"
            })
        }) : e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-6",
            children: [e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [e.jsx("h3", {
                        className: `${(U=(u=s)==null?void 0:u.typography)==null?void 0:U.heading.h4} ${(je=($e=s)==null?void 0:$e.colors)==null?void 0:je.text.primary}`,
                        children: "Gelirler (Revenue)"
                    }), e.jsx("span", {
                        className: "text-neutral-900 font-bold text-lg",
                        children: f(a.summary.totalRevenue)
                    })]
                }), a.revenues.length === 0 ? e.jsxs("div", {
                    className: "text-center py-8 text-neutral-500",
                    children: [e.jsx(Fe, {
                        className: "w-8 h-8 mx-auto mb-2 opacity-50"
                    }), e.jsx("p", {
                        className: "text-sm",
                        children: "Gelir kaydı bulunamadı"
                    })]
                }) : e.jsx("div", {
                    className: "space-y-2",
                    children: a.revenues.map((w, Te) => e.jsxs("div", {
                        className: "flex justify-between items-center py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors",
                        children: [e.jsxs("div", {
                            className: "flex-1",
                            children: [e.jsx("p", {
                                className: "text-sm font-medium text-neutral-900",
                                children: w.accountName
                            }), h === "detailed" && e.jsx("p", {
                                className: "text-xs text-neutral-500 font-mono",
                                children: w.accountCode
                            })]
                        }), e.jsxs("div", {
                            className: "text-right",
                            children: [e.jsx("p", {
                                className: "text-sm font-bold text-neutral-900",
                                children: f(w.amount)
                            }), h === "detailed" && e.jsx("p", {
                                className: "text-xs text-neutral-500",
                                children: E(w.percentage)
                            })]
                        })]
                    }, Te))
                })]
            }), e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [e.jsx("h3", {
                        className: `${(Ce=(m=s)==null?void 0:m.typography)==null?void 0:Ce.heading.h4} ${(ze=(ge=s)==null?void 0:ge.colors)==null?void 0:ze.text.primary}`,
                        children: "Giderler (Expenses)"
                    }), e.jsx("span", {
                        className: "text-neutral-900 font-bold text-lg",
                        children: f(a.summary.totalExpense)
                    })]
                }), a.expenses.length === 0 ? e.jsxs("div", {
                    className: "text-center py-8 text-neutral-500",
                    children: [e.jsx(Oe, {
                        className: "w-8 h-8 mx-auto mb-2 opacity-50"
                    }), e.jsx("p", {
                        className: "text-sm",
                        children: "Gider kaydı bulunamadı"
                    })]
                }) : e.jsx("div", {
                    className: "space-y-2",
                    children: a.expenses.map((w, Te) => e.jsxs("div", {
                        className: "flex justify-between items-center py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors",
                        children: [e.jsxs("div", {
                            className: "flex-1",
                            children: [e.jsx("p", {
                                className: "text-sm font-medium text-neutral-900",
                                children: w.accountName
                            }), h === "detailed" && e.jsx("p", {
                                className: "text-xs text-neutral-500 font-mono",
                                children: w.accountCode
                            })]
                        }), e.jsxs("div", {
                            className: "text-right",
                            children: [e.jsx("p", {
                                className: "text-sm font-bold text-neutral-900",
                                children: f(w.amount)
                            }), h === "detailed" && e.jsx("p", {
                                className: "text-xs text-neutral-500",
                                children: E(w.percentage)
                            })]
                        })]
                    }, Te))
                })]
            })]
        }), e.jsx("div", {
            className: `${p("md","md","default","lg")} ${j?"bg-neutral-50 border-green-200":"bg-neutral-50 border-red-200"}`,
            children: e.jsxs("div", {
                className: "flex items-center gap-4",
                children: [e.jsx("div", {
                    className: "w-12 h-12 rounded-full flex items-center justify-center bg-neutral-50",
                    children: j ? e.jsx(Fe, {
                        className: "w-6 h-6 text-neutral-900"
                    }) : e.jsx(Oe, {
                        className: "w-6 h-6 text-neutral-900"
                    })
                }), e.jsxs("div", {
                    className: "flex-1",
                    children: [e.jsx("h4", {
                        className: "text-lg font-bold mb-1 text-neutral-900",
                        children: j ? "Kar (Profit)" : "Zarar (Loss)"
                    }), e.jsxs("p", {
                        className: "text-sm text-neutral-900",
                        children: ["Dönem sonucu: ", f(Math.abs(a.summary.netProfit))]
                    })]
                }), e.jsxs("div", {
                    className: "text-right",
                    children: [e.jsxs("p", {
                        className: "text-3xl font-bold text-neutral-900",
                        children: [j ? "+" : "-", f(Math.abs(a.summary.netProfit))]
                    }), e.jsxs("p", {
                        className: "text-sm text-neutral-900",
                        children: ["Kar Marjı: ", E(a.summary.profitMargin)]
                    })]
                })]
            })
        }), e.jsx("div", {
            className: "bg-neutral-50 border border-neutral-200 rounded-lg p-4",
            children: e.jsxs("div", {
                className: "flex items-start gap-3",
                children: [e.jsx(Xe, {
                    className: "w-5 h-5 text-neutral-900 mt-0.5"
                }), e.jsxs("div", {
                    children: [e.jsx("h4", {
                        className: "text-neutral-900 font-semibold mb-1",
                        children: "Rapor Dönemi"
                    }), e.jsxs("p", {
                        className: "text-neutral-900 text-sm",
                        children: [new Date(r).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }), " ", "-", " ", new Date(x).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })]
                    }), e.jsx("p", {
                        className: "text-neutral-900 text-xs mt-1",
                        children: "Bu rapor seçilen tarih aralığındaki tüm gelir ve gider Hesaplarını içerir."
                    })]
                })]
            })
        })]
    })
}

function Qa() {
    var j, Y, T, we, Se, Q, _, ke, L, Ne, X, Z, J, W, ee, se, ae, te, re, H, le, M, V, ne, B, R, ce, F, G, ie, K, oe, de, me, xe, ue, he, pe, ye, d;
    const [a, y] = t.useState({
        assets: [],
        liabilities: [],
        equity: [],
        summary: {
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0,
            totalLiabilitiesAndEquity: 0,
            isBalanced: !0,
            difference: 0
        }
    }), [l, n] = t.useState(!1), [r, v] = t.useState(new Date().toISOString().split("T")[0]), [x, D] = t.useState(new Set(["assets", "liabilities", "equity"]));
    t.useEffect(() => {
        h()
    }, [r]);
    const h = async () => {
        try {
            n(!0);
            const c = new URLSearchParams({
                    date: r
                }),
                $ = await fetch(`/api/accounting/reports/balance-sheet?${c}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
            if (!$.ok) throw new Error("Failed to load balance sheet");
            const k = await $.json();
            y(k.data || k)
        } catch (c) {
            console.error("Failed to load balance sheet:", c), O.error("Bilanço yüklenemedi")
        } finally {
            n(!1)
        }
    }, q = () => {
        try {
            Ma(a.assets, a.liabilities, a.equity, a.summary, r), O.success("Bilanço Excel olarak indirildi")
        } catch {
            O.error("Excel export başarısız oldu")
        }
    }, C = () => {
        window.print()
    }, z = c => {
        D($ => {
            const k = new Set($);
            return k.has(c) ? k.delete(c) : k.add(c), k
        })
    }, b = c => new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY"
    }).format(c), f = c => `${c.toFixed(1)}%`, E = (c, $ = 0) => {
        const k = c.children && c.children.length > 0,
            u = x.has(c.accountCode);
        return e.jsxs("div", {
            children: [e.jsxs("div", {
                className: `flex justify-between items-center py-2 px-3 hover:bg-neutral-50 transition-colors ${$>0?"border-l-2 border-neutral-200":""}`,
                style: {
                    paddingLeft: `${($+1)*12}px`
                },
                children: [e.jsxs("div", {
                    className: "flex items-center gap-2 flex-1",
                    children: [k && e.jsx("button", {
                        onClick: () => z(c.accountCode),
                        className: "p-1 hover:bg-neutral-200 rounded",
                        children: u ? e.jsx(ss, {
                            className: "w-4 h-4 text-neutral-600"
                        }) : e.jsx(as, {
                            className: "w-4 h-4 text-neutral-600"
                        })
                    }), e.jsxs("div", {
                        className: "flex-1",
                        children: [e.jsx("p", {
                            className: `text-sm ${$===0?"font-bold text-neutral-900":"font-medium text-neutral-700"}`,
                            children: c.accountName
                        }), e.jsx("p", {
                            className: "text-xs text-neutral-500 font-mono",
                            children: c.accountCode
                        })]
                    })]
                }), e.jsxs("div", {
                    className: "text-right",
                    children: [e.jsx("p", {
                        className: `text-sm ${$===0?"font-bold text-neutral-900":"font-medium text-neutral-700"}`,
                        children: b(c.amount)
                    }), e.jsx("p", {
                        className: "text-xs text-neutral-500",
                        children: f(c.percentage)
                    })]
                })]
            }), k && u && e.jsx("div", {
                children: c.children.map(U => E(U, $ + 1))
            })]
        }, c.accountCode)
    };
    return e.jsxs("div", {
        className: "space-y-6 max-w-7xl mx-auto",
        children: [e.jsxs("div", {
            className: "flex justify-end items-center gap-2",
            children: [e.jsxs("button", {
                onClick: h,
                className: I(P("md", "outline", "lg"), "gap-2"),
                children: [e.jsx(ls, {
                    className: "w-4 h-4"
                }), "Yenile"]
            }), e.jsxs("button", {
                onClick: C,
                className: I(P("md", "outline", "lg"), "gap-2"),
                children: [e.jsx(js, {
                    className: "w-4 h-4"
                }), "Yazdır"]
            }), e.jsxs("button", {
                onClick: q,
                className: I(P("md", "primary", "lg"), "gap-2"),
                children: [e.jsx(Ze, {
                    className: "w-4 h-4"
                }), "Excel İndir"]
            })]
        }), e.jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
            children: [e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx(ys, {
                        className: "w-8 h-8 text-neutral-900"
                    })
                }), e.jsx("p", {
                    className: `${(Y=(j=s)==null?void 0:j.typography)==null?void 0:Y.stat.lg} text-neutral-900 mb-1`,
                    children: b(a.summary.totalAssets)
                }), e.jsx("p", {
                    className: `${(we=(T=s)==null?void 0:T.typography)==null?void 0:we.body.sm} ${(Q=(Se=s)==null?void 0:Se.colors)==null?void 0:Q.text.secondary}`,
                    children: "Toplam Varlıklar"
                })]
            }), e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx(Oe, {
                        className: "w-8 h-8 text-neutral-800"
                    })
                }), e.jsx("p", {
                    className: `${(ke=(_=s)==null?void 0:_.typography)==null?void 0:ke.stat.lg} text-neutral-900 mb-1`,
                    children: b(a.summary.totalLiabilities)
                }), e.jsx("p", {
                    className: `${(Ne=(L=s)==null?void 0:L.typography)==null?void 0:Ne.body.sm} ${(Z=(X=s)==null?void 0:X.colors)==null?void 0:Z.text.secondary}`,
                    children: "Toplam Borçlar"
                })]
            }), e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx(Fe, {
                        className: "w-8 h-8 text-neutral-700"
                    })
                }), e.jsx("p", {
                    className: `${(W=(J=s)==null?void 0:J.typography)==null?void 0:W.stat.lg} text-neutral-900 mb-1`,
                    children: b(a.summary.totalEquity)
                }), e.jsx("p", {
                    className: `${(se=(ee=s)==null?void 0:ee.typography)==null?void 0:se.body.sm} ${(te=(ae=s)==null?void 0:ae.colors)==null?void 0:te.text.secondary}`,
                    children: "Özkaynak"
                })]
            }), e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx(ps, {
                        className: "w-8 h-8 text-neutral-600"
                    })
                }), e.jsx("p", {
                    className: `${(H=(re=s)==null?void 0:re.typography)==null?void 0:H.stat.lg} text-neutral-900 mb-1`,
                    children: a.summary.isBalanced ? "✓" : "✗"
                }), e.jsx("p", {
                    className: `${(M=(le=s)==null?void 0:le.typography)==null?void 0:M.body.sm} ${(ne=(V=s)==null?void 0:V.colors)==null?void 0:ne.text.secondary}`,
                    children: a.summary.isBalanced ? "Dengede" : "Dengesiz"
                })]
            })]
        }), e.jsx("div", {
            className: p("md", "md", "default", "lg"),
            children: e.jsxs("div", {
                className: "flex items-center gap-4",
                children: [e.jsxs("div", {
                    className: "flex-1",
                    children: [e.jsxs("label", {
                        className: `block ${(R=(B=s)==null?void 0:B.typography)==null?void 0:R.label.sm} ${(F=(ce=s)==null?void 0:ce.colors)==null?void 0:F.text.primary} mb-1`,
                        children: [e.jsx(rs, {
                            className: "w-4 h-4 inline mr-1"
                        }), "Rapor Tarihi"]
                    }), e.jsx("input", {
                        type: "date",
                        value: r,
                        onChange: c => v(c.target.value),
                        className: "w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
                    })]
                }), e.jsxs("div", {
                    className: "flex-1",
                    children: [e.jsx("p", {
                        className: "text-sm text-neutral-600 mb-1",
                        children: "Bilanço Denklemi:"
                    }), e.jsx("p", {
                        className: "text-lg font-mono font-bold text-neutral-900",
                        children: "Varlıklar = Borçlar + Özkaynak"
                    })]
                })]
            })
        }), l ? e.jsx("div", {
            className: "flex items-center justify-center h-64",
            children: e.jsx("div", {
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"
            })
        }) : e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-6",
            children: [e.jsxs("div", {
                className: p("md", "md", "default", "lg"),
                children: [e.jsxs("div", {
                    className: "border-b border-neutral-200 pb-3 mb-4",
                    children: [e.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [e.jsx("h3", {
                            className: `${(ie=(G=s)==null?void 0:G.typography)==null?void 0:ie.heading.h3} ${(oe=(K=s)==null?void 0:K.colors)==null?void 0:oe.text.primary}`,
                            children: "Varlıklar (Assets)"
                        }), e.jsx("button", {
                            onClick: () => z("assets"),
                            className: "p-1 hover:bg-neutral-100 rounded",
                            children: x.has("assets") ? e.jsx(ss, {
                                className: "w-5 h-5"
                            }) : e.jsx(as, {
                                className: "w-5 h-5"
                            })
                        })]
                    }), e.jsx("p", {
                        className: "text-neutral-900 font-bold text-xl mt-1",
                        children: b(a.summary.totalAssets)
                    })]
                }), x.has("assets") && e.jsx("div", {
                    className: "space-y-1",
                    children: a.assets.length === 0 ? e.jsxs("div", {
                        className: "text-center py-8 text-neutral-500",
                        children: [e.jsx(ys, {
                            className: "w-8 h-8 mx-auto mb-2 opacity-50"
                        }), e.jsx("p", {
                            className: "text-sm",
                            children: "Varlık kaydı bulunamadı"
                        })]
                    }) : a.assets.map(c => E(c))
                })]
            }), e.jsxs("div", {
                className: "space-y-6 max-w-7xl mx-auto",
                children: [e.jsxs("div", {
                    className: p("md", "md", "default", "lg"),
                    children: [e.jsxs("div", {
                        className: "border-b border-neutral-200 pb-3 mb-4",
                        children: [e.jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [e.jsx("h3", {
                                className: `${(me=(de=s)==null?void 0:de.typography)==null?void 0:me.heading.h3} ${(ue=(xe=s)==null?void 0:xe.colors)==null?void 0:ue.text.primary}`,
                                children: "Borçlar (Liabilities)"
                            }), e.jsx("button", {
                                onClick: () => z("liabilities"),
                                className: "p-1 hover:bg-neutral-100 rounded",
                                children: x.has("liabilities") ? e.jsx(ss, {
                                    className: "w-5 h-5"
                                }) : e.jsx(as, {
                                    className: "w-5 h-5"
                                })
                            })]
                        }), e.jsx("p", {
                            className: "text-neutral-900 font-bold text-xl mt-1",
                            children: b(a.summary.totalLiabilities)
                        })]
                    }), x.has("liabilities") && e.jsx("div", {
                        className: "space-y-1",
                        children: a.liabilities.length === 0 ? e.jsxs("div", {
                            className: "text-center py-8 text-neutral-500",
                            children: [e.jsx(Oe, {
                                className: "w-8 h-8 mx-auto mb-2 opacity-50"
                            }), e.jsx("p", {
                                className: "text-sm",
                                children: "Borç kaydı bulunamadı"
                            })]
                        }) : a.liabilities.map(c => E(c))
                    })]
                }), e.jsxs("div", {
                    className: p("md", "md", "default", "lg"),
                    children: [e.jsxs("div", {
                        className: "border-b border-neutral-200 pb-3 mb-4",
                        children: [e.jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [e.jsx("h3", {
                                className: `${(pe=(he=s)==null?void 0:he.typography)==null?void 0:pe.heading.h3} ${(d=(ye=s)==null?void 0:ye.colors)==null?void 0:d.text.primary}`,
                                children: "Özkaynak (Equity)"
                            }), e.jsx("button", {
                                onClick: () => z("equity"),
                                className: "p-1 hover:bg-neutral-100 rounded",
                                children: x.has("equity") ? e.jsx(ss, {
                                    className: "w-5 h-5"
                                }) : e.jsx(as, {
                                    className: "w-5 h-5"
                                })
                            })]
                        }), e.jsx("p", {
                            className: "text-neutral-900 font-bold text-xl mt-1",
                            children: b(a.summary.totalEquity)
                        })]
                    }), x.has("equity") && e.jsx("div", {
                        className: "space-y-1",
                        children: a.equity.length === 0 ? e.jsxs("div", {
                            className: "text-center py-8 text-neutral-500",
                            children: [e.jsx(Fe, {
                                className: "w-8 h-8 mx-auto mb-2 opacity-50"
                            }), e.jsx("p", {
                                className: "text-sm",
                                children: "Özkaynak kaydı bulunamadı"
                            })]
                        }) : a.equity.map(c => E(c))
                    })]
                })]
            })]
        }), e.jsx("div", {
            className: `${p("md","md","default","lg")} bg-neutral-50 border-neutral-200`,
            children: e.jsxs("div", {
                className: "flex items-center gap-4",
                children: [e.jsx("div", {
                    className: "w-12 h-12 rounded-full flex items-center justify-center bg-neutral-100",
                    children: e.jsx(ps, {
                        className: "w-6 h-6 text-neutral-900"
                    })
                }), e.jsxs("div", {
                    className: "flex-1",
                    children: [e.jsx("h4", {
                        className: "text-lg font-bold mb-1 text-neutral-900",
                        children: a.summary.isBalanced ? "Bilanço Dengede" : "Bilanço Dengesiz"
                    }), e.jsxs("div", {
                        className: "flex items-center gap-4 text-sm text-neutral-700",
                        children: [e.jsxs("span", {
                            children: ["Varlıklar: ", b(a.summary.totalAssets)]
                        }), e.jsx("span", {
                            children: "="
                        }), e.jsxs("span", {
                            children: ["Borçlar + Özkaynak:", " ", b(a.summary.totalLiabilitiesAndEquity)]
                        }), !a.summary.isBalanced && e.jsxs("span", {
                            className: "font-bold",
                            children: ["(Fark: ", b(Math.abs(a.summary.difference)), ")"]
                        })]
                    })]
                })]
            })
        }), !a.summary.isBalanced && e.jsx("div", {
            className: "bg-neutral-50 border border-neutral-200 rounded-lg p-4",
            children: e.jsxs("div", {
                className: "flex items-start gap-3",
                children: [e.jsx(Xe, {
                    className: "w-5 h-5 text-neutral-900 mt-0.5"
                }), e.jsxs("div", {
                    children: [e.jsx("h4", {
                        className: "text-neutral-900 font-semibold mb-1",
                        children: "Bilanço Dengesi Uyuşmuyor"
                    }), e.jsxs("p", {
                        className: "text-neutral-700 text-sm mb-2",
                        children: ["Varlıklar toplamı, borçlar ve özkaynak toplamına eşit değil. Fark:", " ", b(Math.abs(a.summary.difference))]
                    }), e.jsx("p", {
                        className: "text-neutral-600 text-xs",
                        children: "Lütfen hesap kayıtlarınızı ve yevmiye defterini kontrol edin. Muhasebenin temel denklemi: Varlıklar = Borçlar + Özkaynak"
                    })]
                })]
            })
        }), e.jsx("div", {
            className: "bg-neutral-50 border border-neutral-200 rounded-lg p-4",
            children: e.jsxs("div", {
                className: "flex items-start gap-3",
                children: [e.jsx(Xe, {
                    className: "w-5 h-5 text-neutral-900 mt-0.5"
                }), e.jsxs("div", {
                    children: [e.jsx("h4", {
                        className: "text-neutral-900 font-semibold mb-1",
                        children: "Rapor Tarihi"
                    }), e.jsx("p", {
                        className: "text-neutral-700 text-sm",
                        children: new Date(r).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })
                    }), e.jsx("p", {
                        className: "text-neutral-600 text-xs mt-1",
                        children: "Bu bilanço, belirtilen tarih itibariyle şirketin finansal durumunu gösterir."
                    })]
                })]
            })
        })]
    })
}
const Xa = ({
        count: a = 4,
        height: y = "h-32"
    }) => e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
        children: Array.from({
            length: a
        }).map((l, n) => e.jsxs("div", {
            className: `bg-white rounded-2xl border border-neutral-200 p-6 ${y}`,
            children: [e.jsx("div", {
                className: "flex items-start justify-between mb-4",
                children: e.jsx("div", {
                    className: "w-12 h-12 bg-neutral-200 rounded-xl animate-pulse"
                })
            }), e.jsx("div", {
                className: "h-4 bg-neutral-200 rounded w-24 mb-3 animate-pulse"
            }), e.jsx("div", {
                className: "h-8 bg-neutral-200 rounded w-32 animate-pulse"
            })]
        }, n))
    }),
    Za = ({
        message: a = "Yükleniyor..."
    }) => e.jsxs("div", {
        className: "flex flex-col items-center justify-center py-12 px-4",
        children: [e.jsxs("div", {
            className: "relative",
            children: [e.jsx("div", {
                className: "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neutral-600"
            }), e.jsx("div", {
                className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                children: e.jsx("div", {
                    className: "animate-ping rounded-full h-4 w-4 bg-blue-400"
                })
            })]
        }), e.jsx("p", {
            className: "mt-6 text-neutral-600 font-medium animate-pulse",
            children: a
        }), e.jsx("div", {
            className: "mt-4 w-64 h-1 bg-neutral-200 rounded-full overflow-hidden",
            children: e.jsx("div", {
                className: "h-full bg-blue-600 animate-progress"
            })
        }), e.jsx("style", {
            jsx: !0,
            children: `
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `
        })]
    });
class Re extends t.Component {
    constructor(l) {
        super(l);
        ms(this, "handleReload", () => {
            window.location.reload()
        });
        ms(this, "handleGoHome", () => {
            window.location.href = "/"
        });
        ms(this, "handleReset", () => {
            this.setState({
                hasError: !1,
                error: null,
                errorInfo: null
            })
        });
        this.state = {
            hasError: !1,
            error: null,
            errorInfo: null
        }
    }
    static getDerivedStateFromError(l) {
        return {
            hasError: !0,
            error: l,
            errorInfo: null
        }
    }
    componentDidCatch(l, n) {
        console.error("ErrorBoundary caught an error:", l, n), this.setState({
            error: l,
            errorInfo: n
        })
    }
    render() {
        if (this.state.hasError) {
            const {
                fallbackTitle: l,
                fallbackMessage: n
            } = this.props, r = !1;
            return e.jsx("div", {
                className: "min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4",
                children: e.jsxs("div", {
                    className: "max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-neutral-200 p-8",
                    children: [e.jsx("div", {
                        className: "flex justify-center mb-6",
                        children: e.jsx("div", {
                            className: "w-20 h-20 bg-red-100 rounded-full flex items-center justify-center",
                            children: e.jsx(Da, {
                                className: "text-red-600",
                                size: 40
                            })
                        })
                    }), e.jsx("h1", {
                        className: "text-3xl font-bold text-neutral-900 text-center mb-4",
                        children: l || "Bir Hata Oluştu"
                    }), e.jsx("p", {
                        className: "text-neutral-600 text-center mb-8",
                        children: n || "Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenileyin veya ana sayfaya dönün."
                    }), r, e.jsxs("div", {
                        className: "flex flex-col sm:flex-row gap-3 justify-center",
                        children: [e.jsxs("button", {
                            onClick: this.handleReload,
                            className: "px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 font-medium",
                            children: [e.jsx(ls, {
                                size: 18
                            }), "Sayfayı Yenile"]
                        }), e.jsxs("button", {
                            onClick: this.handleGoHome,
                            className: "px-6 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 font-medium",
                            children: [e.jsx(za, {
                                size: 18
                            }), "Ana Sayfaya Dön"]
                        }), r]
                    }), e.jsxs("div", {
                        className: "mt-8 pt-6 border-t border-neutral-200 text-center",
                        children: [e.jsx("p", {
                            className: "text-sm text-neutral-500",
                            children: "Sorun devam ederse, lütfen destek ekibiyle iletişime geçin."
                        }), e.jsxs("p", {
                            className: "text-sm text-neutral-400 mt-2",
                            children: ["Hata ID: ", Date.now().toString(36)]
                        })]
                    })]
                })
            })
        }
        return this.props.children
    }
}
const Le = "px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50",
    Ie = "px-6 py-4 text-sm text-neutral-900",
    Ja = t.lazy(() => fe(() => import("./IncomeTab-czrP9sRK.js"), __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7]))),
    Wa = t.lazy(() => fe(() => import("./ExpenseTab-k5Z33Y5H.js"), __vite__mapDeps([8, 1, 2, 3, 4, 5, 6, 7]))),
    et = t.lazy(() => fe(() => import("./InvoiceList-r5D-a0Sv.js"), __vite__mapDeps([9, 1, 2, 7, 3, 4, 5, 6]))),
    st = t.lazy(() => fe(() => import("./OfferList-CniZt4xK.js"), __vite__mapDeps([10, 1, 2, 7, 3, 4, 5, 6]))),
    at = t.lazy(() => fe(() => import("./AccountingDashboard-DH7Uoszm.js"), __vite__mapDeps([11, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17]))),
    tt = t.lazy(() => fe(() => import("./AccountCardList-C5Ryhl-s.js"), __vite__mapDeps([18, 1, 2, 3, 4, 5, 6, 12, 14, 15, 17, 7])));
t.lazy(() => fe(() => import("./EInvoiceList-CcvFn7DP.js"), __vite__mapDeps([19, 1, 2, 5, 7])));
const rt = t.lazy(() => fe(() => import("./BankReconciliation-DMwfYIQ2.js"), __vite__mapDeps([20, 1, 2, 7, 5]))),
    lt = t.lazy(() => fe(() => import("./DeliveryNoteList-BJx3PtRa.js"), __vite__mapDeps([21, 1, 2, 3, 4, 5, 6, 7]))),
    nt = t.lazy(() => fe(() => import("./InventoryAccounting-CO6uUTdR.js"), __vite__mapDeps([22, 1, 2, 7, 5]))),
    ct = t.lazy(() => fe(() => import("./AdvancedReporting-BHJvQpgi.js"), __vite__mapDeps([23, 1, 2, 3, 4, 5, 6, 7, 12, 17]))),
    it = t.lazy(() => fe(() => import("./CompanyInfo-DZ06CKp_.js"), __vite__mapDeps([24, 1, 2, 25, 3, 4, 5, 6, 7]))),
    ot = t.lazy(() => fe(() => import("./CashBankManagement-B_aINLX5.js"), __vite__mapDeps([26, 1, 2, 25, 3, 4, 5, 6, 7]))),
    dt = t.lazy(() => fe(() => import("./ReminderManagement-mLlcEIfk.js"), __vite__mapDeps([27, 1, 2, 3, 4, 5, 6]))),
    mt = t.lazy(() => fe(() => import("./StatementSharing-CMtZvCpf.js"), __vite__mapDeps([28, 1, 2, 3, 4, 5, 6]))),
    xt = t.lazy(() => fe(() => import("./BarcodeScanner-poJd98YV.js"), __vite__mapDeps([29, 1, 2, 5]))),
    ut = t.lazy(() => fe(() => import("./NotificationsTab-C5M_gowH.js"), __vite__mapDeps([30, 1, 2, 7, 5]))),
    ht = t.lazy(() => fe(() => import("./ToolsTab-BZ8sw7IO.js"), __vite__mapDeps([31, 1, 2, 32, 25, 3, 4, 5, 6, 7, 33]))),
    pt = t.lazy(() => fe(() => import("./SupportTab-99YNF7Bd.js"), __vite__mapDeps([34, 1, 2, 32, 7, 5])));
t.lazy(() => fe(() => import("./IntegrationsTab-LzZ0lInN.js"), __vite__mapDeps([33, 1, 2, 5, 7])));
t.lazy(() => fe(() => import("./CostAccounting-CqSS1aJm.js"), __vite__mapDeps([35, 1, 2, 7, 5])));

function St() {
    var Ts, As, Ds, zs, Ls, Is, Ps, _s, Bs, Rs, Fs, Os, Ms, Ys, Hs, Vs, Gs, Ks, Us, qs, Qs, Xs, Zs, Js, Ws, ea, sa, aa, ta, ra, la, na;
    if (!s || !s.typography || !s.typography.h2) return console.error("? DESIGN_TOKENS is undefined or incomplete!"), e.jsx("div", {
        className: "min-h-screen flex items-center justify-center bg-neutral-50",
        children: e.jsxs("div", {
            className: "text-center p-8 bg-white rounded-xl shadow-lg max-w-md",
            children: [e.jsx("h2", {
                className: "text-2xl font-bold text-red-600 mb-4",
                children: "Design System Error"
            }), e.jsx("p", {
                className: "text-neutral-700 mb-4",
                children: "DESIGN_TOKENS failed to load. Please refresh the page."
            }), e.jsx("button", {
                onClick: () => window.location.reload(),
                className: "px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800",
                children: "Refresh Page"
            })]
        })
    });
    const [a, y] = t.useState("dashboard"), [l, n] = t.useState(null), [r, v] = t.useState(!0), [x, D] = t.useState([]), [h, q] = t.useState(!1), [C, z] = t.useState(""), b = ia(C, 500), [f, E] = t.useState(""), [j, Y] = t.useState(1), [T, we] = t.useState(1), [Se, Q] = t.useState("all"), [_, ke] = t.useState(""), [L, Ne] = t.useState(""), [X, Z] = t.useState(""), [J, W] = t.useState(""), [ee, se] = t.useState(!1), [ae, te] = t.useState([]), [re, H] = t.useState([]), [le, M] = t.useState(!1), [V, ne] = t.useState(""), B = ia(V, 500), [R, ce] = t.useState(""), [F, G] = t.useState(1), [ie, K] = t.useState(1), [oe, de] = t.useState([]), [me, xe] = t.useState("all"), [ue, he] = t.useState(""), [pe, ye] = t.useState(""), [d, c] = t.useState(""), [$, k] = t.useState(""), [u, U] = t.useState(!1), [$e, je] = t.useState(null), [m, Ce] = t.useState(null), [ge, ze] = t.useState([]), [w, Te] = t.useState(!1), [He, ns] = t.useState([]), [cs, o] = t.useState(!1), [A, Ee] = t.useState(null), [Me, ve] = t.useState(!1), [Pe, Ye] = t.useState(!1), [is, Je] = t.useState(null), [We, Ke] = t.useState(!1), [os, es] = t.useState(null), [Ae, Ue] = t.useState("checks"), [_e, ds] = t.useState("advanced");
    ka();
    const [ks] = Sa();
    t.useEffect(() => {
        ua()
    }, []), t.useEffect(() => {
        const i = ks.get("tab");
        i && Cs.some(S => S.id === i) && y(i)
    }, [ks]), t.useEffect(() => {
        a === "invoice" && (Y(1), Ss())
    }, [a, b, f]), t.useEffect(() => {
        a === "invoice" && Ss()
    }, [j]), t.useEffect(() => {
        a === "offer" && (G(1), Es())
    }, [a, B, R]), t.useEffect(() => {
        a === "offer" && Es()
    }, [F]), t.useEffect(() => {
        a === "receivables" && (Ae === "checks" ? gs() : Ae === "promissory" ? bs() : Ae === "aging" && ya())
    }, [a, Ae]);
    const ua = async () => {
        var i, S, g;
        try {
            v(!0), console.log("?? Loading accounting stats...");
            const N = await ba.getStats();
            console.log("? Stats response:", N.data), n(N.data.data)
        } catch (N) {
            console.error("? Failed to load accounting stats:", N), console.error("Error details:", (i = N.response) == null ? void 0 : i.data), Be.error("İstatistikler yüklenemedi: " + (((g = (S = N.response) == null ? void 0 : S.data) == null ? void 0 : g.message) || N.message))
        } finally {
            v(!1)
        }
    }, Ss = async () => {
        var i, S, g;
        try {
            q(!0), console.log("?? Loading invoices...", {
                invoiceStatusFilter: f,
                debouncedInvoiceSearch: b,
                currentPage: j
            });
            const N = await fa.getAll({
                status: f || void 0,
                search: b || void 0,
                page: j,
                limit: 10
            });
            console.log("? Invoices response:", N.data), D(N.data.data), we(N.data.pagination.totalPages)
        } catch (N) {
            console.error("? Failed to load invoices:", N), console.error("Error details:", (i = N.response) == null ? void 0 : i.data), Be.error("Faturalar yüklenemedi: " + (((g = (S = N.response) == null ? void 0 : S.data) == null ? void 0 : g.message) || N.message))
        } finally {
            q(!1)
        }
    }, Es = async () => {
        var i, S, g;
        try {
            M(!0), console.log("?? Loading offers...", {
                offerStatusFilter: R,
                debouncedOfferSearch: B,
                offerCurrentPage: F
            });
            const N = await Na.getAll({
                status: R || void 0,
                search: B || void 0,
                page: F,
                limit: 10
            });
            console.log("? Offers response:", N.data), H(N.data.data), K(N.data.pagination.totalPages)
        } catch (N) {
            console.error("? Failed to load offers:", N), console.error("Error details:", (i = N.response) == null ? void 0 : i.data), Be.error("Teklifler yüklenemedi: " + (((g = (S = N.response) == null ? void 0 : S.data) == null ? void 0 : g.message) || N.message))
        } finally {
            M(!1)
        }
    }, gs = async () => {
        var i, S;
        try {
            Te(!0);
            const g = await us.getAll({
                limit: 50
            });
            ze(g.data.data || g.data)
        } catch (g) {
            console.error("Failed to load checks:", g), Be.error("�ekler y�klenemedi: " + (((S = (i = g.response) == null ? void 0 : i.data) == null ? void 0 : S.message) || g.message))
        } finally {
            Te(!1)
        }
    }, bs = async () => {
        var i, S;
        try {
            o(!0);
            const g = await hs.getAll({
                limit: 50
            });
            ns(g.data.data || g.data)
        } catch (g) {
            console.error("Failed to load promissory notes:", g), Be.error("Senetler y�klenemedi: " + (((S = (i = g.response) == null ? void 0 : i.data) == null ? void 0 : S.message) || g.message))
        } finally {
            o(!1)
        }
    }, ha = async i => {
        var S, g;
        if (confirm("Bu �eki silmek istedi�inizden emin misiniz?")) try {
            await us.delete(i), Be.success("�ek ba�ar�yla silindi"), gs()
        } catch (N) {
            console.error("Failed to delete check:", N), Be.error("�ek silinemedi: " + (((g = (S = N.response) == null ? void 0 : S.data) == null ? void 0 : g.message) || N.message))
        }
    }, pa = async i => {
        var S, g;
        if (confirm("Bu senedi silmek istedi�inizden emin misiniz?")) try {
            await hs.delete(i), Be.success("Senet ba�ar�yla silindi"), bs()
        } catch (N) {
            console.error("Failed to delete promissory note:", N), Be.error("Senet silinemedi: " + (((g = (S = N.response) == null ? void 0 : S.data) == null ? void 0 : g.message) || N.message))
        }
    }, ya = async () => {
        var i, S;
        try {
            ve(!0);
            const g = await va.getCombinedAging();
            Ee(g.data.data || g.data)
        } catch (g) {
            console.error("Failed to load aging data:", g), Be.error("Ya�land�rma verisi al�namad�: " + (((S = (i = g.response) == null ? void 0 : i.data) == null ? void 0 : S.message) || g.message))
        } finally {
            ve(!1)
        }
    }, Ge = i => new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(i), $s = i => new Date(i).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }), Cs = [{
        id: "dashboard",
        label: "Ana Sayfa",
        icon: e.jsx(ws, {
            size: 18
        })
    }, {
        id: "income",
        label: "Gelirler",
        icon: e.jsx(Fe, {
            size: 18
        })
    }, {
        id: "expense",
        label: "Giderler",
        icon: e.jsx(Oe, {
            size: 18
        })
    }, {
        id: "reports",
        label: "Raporlar",
        icon: e.jsx(xa, {
            size: 18
        })
    }, {
        id: "invoice",
        label: "Fatura Takibi",
        icon: e.jsx(xs, {
            size: 18
        })
    }, {
        id: "offer",
        label: "Teklif Yönetimi",
        icon: e.jsx(La, {
            size: 18
        })
    }, {
        id: "current-accounts",
        label: "Cari Hesaplar",
        icon: e.jsx(Ia, {
            size: 18
        })
    }, {
        id: "receivables",
        label: "Alacak Yönetimi",
        icon: e.jsx(ts, {
            size: 18
        })
    }, {
        id: "chart-of-accounts",
        label: "Hesap Planı",
        icon: e.jsx(ws, {
            size: 18
        })
    }, {
        id: "inventory",
        label: "Stok Muhasebesi",
        icon: e.jsx(ca, {
            size: 18
        })
    }, {
        id: "company",
        label: "Şirket Bilgileri",
        icon: e.jsx(ys, {
            size: 18
        })
    }, {
        id: "cash-bank",
        label: "Kasa & Banka",
        icon: e.jsx(Pa, {
            size: 18
        })
    }, {
        id: "delivery",
        label: "İrsaliye",
        icon: e.jsx(ca, {
            size: 18
        })
    }, {
        id: "reconciliation",
        label: "Banka Mutabakat",
        icon: e.jsx(ys, {
            size: 18
        })
    }, {
        id: "tools",
        label: "İşletme Kolaylıkları",
        icon: e.jsx(_a, {
            size: 18
        })
    }, {
        id: "support",
        label: "Yardım & Araçlar",
        icon: e.jsx(Ba, {
            size: 18
        })
    }];
    return e.jsxs("div", {
        className: "max-w-full mx-auto px-2 sm:px-4 lg:px-6 space-y-4 pb-10",
        children: [r ? e.jsx(Xa, {
            count: 4
        }) : e.jsxs("div", {
            className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
            children: [e.jsxs("div", {
                className: p("sm", "sm", "default", "xl"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-3",
                    children: [e.jsx("div", {
                        className: De("success"),
                        children: e.jsx(Fe, {
                            size: 20
                        })
                    }), l && l.invoiceCount > 0 && e.jsxs("span", {
                        className: (As = (Ts = s) == null ? void 0 : Ts.statCard) == null ? void 0 : As.badge,
                        children: [l.invoiceCount, " fatura"]
                    })]
                }), e.jsx("h3", {
                    className: (zs = (Ds = s) == null ? void 0 : Ds.statCard) == null ? void 0 : zs.value,
                    children: l ? Ge(l.totalRevenue) : "?0"
                }), e.jsx("p", {
                    className: (Is = (Ls = s) == null ? void 0 : Ls.statCard) == null ? void 0 : Is.label,
                    children: "Bu Ay Gelir"
                })]
            }), e.jsxs("div", {
                className: p("sm", "sm", "default", "xl"),
                children: [e.jsx("div", {
                    className: "flex items-center justify-between mb-3",
                    children: e.jsx("div", {
                        className: De("error"),
                        children: e.jsx(Oe, {
                            size: 20
                        })
                    })
                }), e.jsx("h3", {
                    className: (_s = (Ps = s) == null ? void 0 : Ps.statCard) == null ? void 0 : _s.value,
                    children: l ? Ge(l.totalExpenses) : "?0"
                }), e.jsx("p", {
                    className: (Rs = (Bs = s) == null ? void 0 : Bs.statCard) == null ? void 0 : Rs.label,
                    children: "Bu Ay Gider"
                })]
            }), e.jsxs("div", {
                className: p("sm", "sm", "default", "xl"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-3",
                    children: [e.jsx("div", {
                        className: De("info"),
                        children: e.jsx(ts, {
                            size: 20
                        })
                    }), e.jsx("span", {
                        className: (Os = (Fs = s) == null ? void 0 : Fs.statCard) == null ? void 0 : Os.badge,
                        children: "Net"
                    })]
                }), e.jsx("h3", {
                    className: (Ys = (Ms = s) == null ? void 0 : Ms.statCard) == null ? void 0 : Ys.value,
                    children: l ? Ge(l.netProfit) : "?0"
                }), e.jsx("p", {
                    className: (Vs = (Hs = s) == null ? void 0 : Hs.statCard) == null ? void 0 : Vs.label,
                    children: "Net K�r"
                })]
            }), e.jsxs("div", {
                className: p("sm", "sm", "default", "xl"),
                children: [e.jsxs("div", {
                    className: "flex items-center justify-between mb-3",
                    children: [e.jsx("div", {
                        className: De("warning"),
                        children: e.jsx(da, {
                            size: 20
                        })
                    }), e.jsx("span", {
                        className: (Ks = (Gs = s) == null ? void 0 : Gs.statCard) == null ? void 0 : Ks.badge,
                        children: "Bekleyen"
                    })]
                }), e.jsx("h3", {
                    className: (qs = (Us = s) == null ? void 0 : Us.statCard) == null ? void 0 : qs.value,
                    children: l ? Ge(l.totalOverdue) : "?0"
                }), e.jsx("p", {
                    className: (Xs = (Qs = s) == null ? void 0 : Qs.statCard) == null ? void 0 : Xs.label,
                    children: "Vade Ge�mi�"
                }), l && l.totalCollections > 0 && e.jsxs("p", {
                    className: (Js = (Zs = s) == null ? void 0 : Zs.statCard) == null ? void 0 : Js.subtitle,
                    children: ["Bu ay: ", Ge(l.totalCollections)]
                })]
            })]
        }), e.jsx("div", {
            className: p("none", "sm", "default", "xl"),
            children: e.jsxs("div", {
                className: "flex flex-col lg:flex-row",
                children: [e.jsx("nav", {
                    className: "flex flex-row gap-1 overflow-x-auto border-b border-neutral-200 lg:border-b-0 lg:border-r lg:w-56 lg:flex-col p-2 flex-shrink-0",
                    children: Cs.map(i => e.jsxs("button", {
                        onClick: () => y(i.id),
                        className: Ve(a === i.id, "vertical"),
                        children: [i.icon, e.jsx("span", {
                            className: "whitespace-nowrap",
                            children: i.label
                        })]
                    }, i.id))
                }), e.jsx("div", {
                    className: "flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full",
                    children: e.jsx(Re, {
                        fallbackTitle: "Muhasebe Mod�l� Hatas�",
                        fallbackMessage: "Muhasebe mod�l�nde bir sorun olu�tu. L�tfen sayfay� yenileyin.",
                        children: e.jsxs(t.Suspense, {
                            fallback: e.jsx(Za, {
                                message: "��erik y�kleniyor..."
                            }),
                            children: [a === "dashboard" && e.jsx(at, {}), a === "income" && e.jsx(Ja, {}), a === "expense" && e.jsx(Wa, {}), a === "chart-of-accounts" && e.jsx(Ka, {}), a === "current-accounts" && e.jsx(tt, {}), a === "reports" && e.jsxs("div", {
                                className: "space-y-6 max-w-7xl mx-auto",
                                children: [e.jsx("h2", {
                                    className: (ea = (Ws = s) == null ? void 0 : Ws.typography) == null ? void 0 : ea.h2,
                                    children: "Raporlar"
                                }), e.jsxs("div", {
                                    className: "flex gap-4 border-b border-neutral-200 mb-6",
                                    children: [e.jsx("button", {
                                        onClick: () => ds("advanced"),
                                        className: Ve(_e === "advanced", "underline"),
                                        children: "Gelişmiş Raporlar"
                                    }), e.jsx("button", {
                                        onClick: () => ds("trial-balance"),
                                        className: Ve(_e === "trial-balance", "underline"),
                                        children: "Mizan"
                                    }), e.jsx("button", {
                                        onClick: () => ds("income-statement"),
                                        className: Ve(_e === "income-statement", "underline"),
                                        children: "Gelir-Gider Tablosu"
                                    }), e.jsx("button", {
                                        onClick: () => ds("balance-sheet"),
                                        className: Ve(_e === "balance-sheet", "underline"),
                                        children: "Bilanço"
                                    })]
                                }), _e === "advanced" && e.jsx(ct, {}), _e === "trial-balance" && e.jsx(Ua, {}), _e === "income-statement" && e.jsx(qa, {}), _e === "balance-sheet" && e.jsx(Qa, {})]
                            }), a === "receivables" && e.jsxs("div", {
                                className: "space-y-6 max-w-7xl mx-auto",
                                children: [e.jsx("h2", {
                                    className: (aa = (sa = s) == null ? void 0 : sa.typography) == null ? void 0 : aa.h2,
                                    children: "Alacak Yönetimi"
                                }), e.jsxs("div", {
                                    className: "flex gap-4 border-b border-neutral-200 mb-6",
                                    children: [e.jsx("button", {
                                        onClick: () => Ue("checks"),
                                        className: Ve(Ae === "checks", "underline"),
                                        children: "�ekler"
                                    }), e.jsx("button", {
                                        onClick: () => Ue("promissory"),
                                        className: Ve(Ae === "promissory", "underline"),
                                        children: "Senetler"
                                    }), e.jsx("button", {
                                        onClick: () => Ue("aging"),
                                        className: Ve(Ae === "aging", "underline"),
                                        children: "Ya�land�rma Raporu"
                                    })]
                                }), Ae === "checks" && e.jsxs("div", {
                                    className: "space-y-4",
                                    children: [e.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [e.jsx("h3", {
                                            className: (ra = (ta = s) == null ? void 0 : ta.typography) == null ? void 0 : ra.h3,
                                            children: "�ekler"
                                        }), e.jsxs("button", {
                                            onClick: () => {
                                                Je(null), Ye(!0)
                                            },
                                            className: I(P("md", "primary", "xl"), "gap-2"),
                                            children: [e.jsx(xs, {
                                                size: 18
                                            }), "Yeni �ek"]
                                        })]
                                    }), e.jsx("div", {
                                        className: p("none", "sm", "default", "xl"),
                                        children: w ? e.jsx("div", {
                                            className: "p-12 text-center text-neutral-600",
                                            children: "�ekler y�kleniyor..."
                                        }) : ge.length === 0 ? e.jsx("div", {
                                            className: "p-12 text-center text-neutral-600",
                                            children: "�ek bulunamad�"
                                        }) : e.jsx("div", {
                                            className: "overflow-x-auto",
                                            children: e.jsxs("table", {
                                                className: "min-w-full w-full",
                                                children: [e.jsx("thead", {
                                                    className: "bg-neutral-50 border-b border-neutral-200",
                                                    children: e.jsxs("tr", {
                                                        children: [e.jsx("th", {
                                                            className: Le,
                                                            children: "No"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "M��teri"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "Tutar"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "Vade"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "Durum"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "��lemler"
                                                        })]
                                                    })
                                                }), e.jsx("tbody", {
                                                    className: "bg-white divide-y divide-neutral-100",
                                                    children: ge.map(i => {
                                                        var S;
                                                        return e.jsxs("tr", {
                                                            className: "hover:bg-neutral-50 transition-colors",
                                                            children: [e.jsx("td", {
                                                                className: Ie,
                                                                children: i.documentNumber || `#${i.id}`
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: ((S = i.customer) == null ? void 0 : S.name) || i.customerName || "-"
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: Ge(i.amount || 0)
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: i.dueDate ? $s(i.dueDate) : "-"
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: i.status || "-"
                                                            }), e.jsx("td", {
                                                                className: `${Ie} whitespace-nowrap`,
                                                                children: e.jsxs("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [e.jsx("button", {
                                                                        onClick: () => {
                                                                            Je(i), Ye(!0)
                                                                        },
                                                                        className: "text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50",
                                                                        title: "D�zenle",
                                                                        children: e.jsx(Ns, {
                                                                            size: 16
                                                                        })
                                                                    }), e.jsx("button", {
                                                                        onClick: () => ha(i.id),
                                                                        className: "text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50",
                                                                        title: "Sil",
                                                                        children: e.jsx(vs, {
                                                                            size: 16
                                                                        })
                                                                    })]
                                                                })
                                                            })]
                                                        }, i.id)
                                                    })
                                                })]
                                            })
                                        })
                                    })]
                                }), Ae === "promissory" && e.jsxs("div", {
                                    className: "space-y-4",
                                    children: [e.jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [e.jsx("h3", {
                                            className: (na = (la = s) == null ? void 0 : la.typography) == null ? void 0 : na.h3,
                                            children: "Senetler"
                                        }), e.jsxs("button", {
                                            onClick: () => {
                                                es(null), Ke(!0)
                                            },
                                            className: I(P("md", "primary", "xl"), "gap-2"),
                                            children: [e.jsx(xs, {
                                                size: 18
                                            }), "Yeni Senet"]
                                        })]
                                    }), e.jsx("div", {
                                        className: p("none", "sm", "default", "xl"),
                                        children: cs ? e.jsx("div", {
                                            className: "p-12 text-center text-neutral-600",
                                            children: "Senetler y�kleniyor..."
                                        }) : He.length === 0 ? e.jsx("div", {
                                            className: "p-12 text-center text-neutral-600",
                                            children: "Senet bulunamad�"
                                        }) : e.jsx("div", {
                                            className: "overflow-x-auto",
                                            children: e.jsxs("table", {
                                                className: "min-w-full w-full",
                                                children: [e.jsx("thead", {
                                                    className: "bg-neutral-50 border-b border-neutral-200",
                                                    children: e.jsxs("tr", {
                                                        children: [e.jsx("th", {
                                                            className: Le,
                                                            children: "No"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "M��teri"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "Tutar"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "Vade"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "Durum"
                                                        }), e.jsx("th", {
                                                            className: Le,
                                                            children: "��lemler"
                                                        })]
                                                    })
                                                }), e.jsx("tbody", {
                                                    className: "bg-white divide-y divide-neutral-100",
                                                    children: He.map(i => {
                                                        var S;
                                                        return e.jsxs("tr", {
                                                            className: "hover:bg-neutral-50 transition-colors",
                                                            children: [e.jsx("td", {
                                                                className: Ie,
                                                                children: i.documentNumber || `#${i.id}`
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: ((S = i.customer) == null ? void 0 : S.name) || i.customerName || "-"
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: Ge(i.amount || 0)
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: i.dueDate ? $s(i.dueDate) : "-"
                                                            }), e.jsx("td", {
                                                                className: Ie,
                                                                children: i.status || "-"
                                                            }), e.jsx("td", {
                                                                className: `${Ie} whitespace-nowrap`,
                                                                children: e.jsxs("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [e.jsx("button", {
                                                                        onClick: () => {
                                                                            es(i), Ke(!0)
                                                                        },
                                                                        className: "text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50",
                                                                        title: "D�zenle",
                                                                        children: e.jsx(Ns, {
                                                                            size: 16
                                                                        })
                                                                    }), e.jsx("button", {
                                                                        onClick: () => pa(i.id),
                                                                        className: "text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50",
                                                                        title: "Sil",
                                                                        children: e.jsx(vs, {
                                                                            size: 16
                                                                        })
                                                                    })]
                                                                })
                                                            })]
                                                        }, i.id)
                                                    })
                                                })]
                                            })
                                        })
                                    })]
                                }), Ae === "aging" && e.jsx("div", {
                                    children: e.jsx(Va, {
                                        data: A,
                                        loading: Me
                                    })
                                })]
                            }), a === "invoice" && e.jsx(Re, {
                                fallbackTitle: "Fatura Listesi Hatas�",
                                fallbackMessage: "Fatura listesi y�klenirken bir sorun olu�tu.",
                                children: e.jsx(t.Suspense, {
                                    fallback: e.jsx("div", {
                                        className: "p-8 text-center",
                                        children: "Y�kleniyor..."
                                    }),
                                    children: e.jsx(et, {})
                                })
                            }), a === "offer" && e.jsx(Re, {
                                fallbackTitle: "Teklif Listesi Hatası",
                                fallbackMessage: "Teklif listesi yüklenirken bir sorun oluştu.",
                                children: e.jsx(t.Suspense, {
                                    fallback: e.jsx("div", {
                                        className: "p-8 text-center",
                                        children: "Yükleniyor..."
                                    }),
                                    children: e.jsx(st, {})
                                })
                            }), a === "delivery" && e.jsx(lt, {}), a === "reconciliation" && e.jsx(rt, {}), a === "inventory" && e.jsx(nt, {}), a === "company" && e.jsx(it, {}), a === "cash-bank" && e.jsx(ot, {}), a === "tools" && e.jsx(Re, {
                                children: e.jsx(ht, {
                                    onNavigate: i => y(i)
                                })
                            }), !1, a === "advisor" && e.jsx(Re, {
                                children: e.jsx(AdvisorTab, {})
                            }), !1, a === "support" && e.jsx(Re, {
                                children: e.jsx(pt, {})
                            }), !1, a === "reminders" && e.jsx(Re, {
                                children: e.jsx(dt, {})
                            }), a === "statements" && e.jsx(Re, {
                                children: e.jsx(mt, {})
                            }), a === "barcode" && e.jsx(Re, {
                                children: e.jsx(xt, {})
                            }), a === "notifications" && e.jsx(Re, {
                                children: e.jsx(ut, {})
                            }), !1]
                        })
                    })
                })]
            })
        }), Pe && e.jsx(Ya, {
            open: Pe,
            onClose: () => Ye(!1),
            onSaved: () => gs(),
            initial: is || void 0
        }), We && e.jsx(Ha, {
            open: We,
            onClose: () => Ke(!1),
            onSaved: () => bs(),
            initial: os || void 0
        })]
    })
}
export {
    St as
    default
};