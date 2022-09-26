const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  startAfter,
  limit,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  where,
  getDoc,
  updateDoc,
  doc,
} = require("firebase/firestore");
const {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} = require("firebase/auth");
require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};
initializeApp(firebaseConfig);

const db = getFirestore();
const auth = getAuth();
const brandsRef = collection(db, "brands");
const itemsRef = collection(db, "items");
const usersRef = collection(db, "users");
const receiptsRef = collection(db, "receipts");

function refSelect(collectionName) {
  let collectionRef;
  switch (collectionName) {
    case "brands":
      collectionRef = brandsRef;
      break;

    case "users":
      collectionRef = usersRef;
      break;

    case "receipts":
      collectionRef = receiptsRef;
      break;

    default:
      collectionRef = itemsRef;
      break;
  }

  return collectionRef;
}

const getSnapshot = async ({ collectionName }) => {
  let items = [];
  await getDocs(refSelect(collectionName))
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id });
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
  return items;
};

const querybyParameter = async (searchValue, sender) => {
  let q1, q2;

  if (sender === "Receipts") {
    q1 = query(receiptsRef, where("company", "==", `${searchValue}`));
    q2 = query(receiptsRef, where("customer", "==", `${searchValue}`));
  } else if (sender === "EditCompany") {
    q1 = query(brandsRef, where("serial", "==", `${searchValue}`));
    q2 = query(brandsRef, where("name", "==", `${searchValue}`));
  } else {
    q1 = query(itemsRef, where("serial", "==", `${searchValue}`));
    q2 = query(itemsRef, where("name", "==", `${searchValue}`));
  }

  const items = [];
  await getDocs(q1).then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      console.log(doc.data());
      items.push({ ...doc.data(), id: doc.id });
    });
  });

  await getDocs(q2).then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      items.push({ ...doc.data(), id: doc.id });
    });
  });
  return items;
};

const addItem = async (item, collectionName) => {
  const q = query(
    refSelect(collectionName),
    where("serial", "==", `${item.serial}`)
  );
  const snapshot = await getDocs(q);
  let message;
  if (snapshot.docs.length !== 0) {
    message = "Girdi hali hazırda eklenmiş!";
  } else {
    await addDoc(refSelect(collectionName), item)
      .then(() => {
        message = "Girdi başarıyla veri tabanına eklendi!";
      })
      .catch((err) => {
        console.log(err);
        message = "Girdi sırasında hata meydana geldi!";
      });
  }

  return message;
};

const addReceipt = async (data) => {
  const { cart, info, currentUser } = data;
  const receipt = {
    company: info.company,
    customer: info.buyer,
    date: serverTimestamp(),
    items: cart,
    currentUser: currentUser,
    total: info.total,
    payment: info.payment,
  };
  cart.forEach(async (item) => {
    await itemSold(item.id, item.amount);
  });
  const message = await addItem(receipt, "receipts");
  return message;
};

const itemSold = async (id, amount) => {
  const docRef = doc(db, "items", id);
  const flag = await getDoc(docRef)
    .then((item) => {
      return item.data();
    })
    .catch((err) => {
      console.log("Ben allahı sikik bir piç.im çünkü: " + err);
    });
  updateDoc(docRef, { stored: flag.stored - amount })
    .then(() => {
      console.log("Satış Başarılı");
    })
    .catch((err) => {
      console.log("Satış Başarısız: " + err);
    });
};

const paginatedQuery = async (collectionName, lastdoc) => {
  let q;
  if (collectionName === "receipts") {
    q = query(
      refSelect(collectionName),
      orderBy("date"),
      startAfter(lastdoc?.date || 0),
      limit(10)
    );
  } else {
    q = query(
      refSelect(collectionName),
      orderBy("serial"),
      startAfter(lastdoc?.serial || 0),
      limit(10)
    );
  }
  const data = await getDocs(q);

  const items = [];
  data.docs.forEach((doc) => {
    items.push({ ...doc.data(), id: doc.id });
  });
  return items;
};

const getDiscount = async (brandID) => {
  const q = await getDocs(brandsRef);

  let discount;
  q.forEach((doc) => {
    if (doc.id === brandID) {
      discount = doc.data();
    }
  });
  return discount.discount;
};

const updateItem = async (item, id, collectionName) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, item)
    .then(() => {
      return "Güncelleme başarılı.";
    })
    .catch(() => {
      return "Güncelleme başarısız.";
    });
};

const deleteItem = async (itemID, collectionName) => {
  const docRef = doc(db, collectionName, itemID);
  const message = await deleteDoc(docRef)
    .then(() => {
      return "Silme İşlemi Başarılı";
    })
    .catch((e) => {
      return "Silme İşlemi Başarısız: " + e;
    });

  return message;
};

const login = async (email, password) => {
  const user = await signInWithEmailAndPassword(auth, email, password)
    .then(async (cred) => {
      const flag = await getUserInfo(cred.user.uid);
      return { status: 200, message: "Giriş Başarılı", user: flag };
    })
    .catch((err) => {
      return {
        status: 400,
        message: "Giriş Başarısız: " + err,
        user: null,
      };
    });

  return user;
};

const logout = async () => {
  const message = await signOut(auth)
    .then(() => {
      return "Çıkış Başarılı";
    })
    .catch((err) => {
      return "Çıkış sırasında hata: " + err;
    });

  return message;
};

const getUserInfo = async (uid) => {
  const q = query(usersRef, where("uid", "==", `${uid}`));
  const data = await getDocs(q);
  let item;
  data.docs.forEach((doc) => {
    item = { ...doc.data(), id: doc.id };
  });
  return item;
};

const searchWithDates = async (fDate, lDate) => {
  const date1 = new Timestamp(fDate);
  const date2 = new Timestamp(lDate);

  const q = query(
    receiptsRef,
    where("date", "<=", date2),
    where("date", ">=", date1)
  );

  const data = await getDocs(q);
  let items = [];
  data.docs.forEach((doc) => {
    items.push({ ...doc.data(), id: doc.id });
  });

  return items;
};

module.exports = {
  getSnapshot,
  addItem,
  paginatedQuery,
  getDiscount,
  querybyParameter,
  updateItem,
  deleteItem,
  login,
  logout,
  addReceipt,
  searchWithDates,
};
