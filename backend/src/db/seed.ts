import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./data/chat.db";
const filePath = url.replace("file:", "");
const sqlite = new Database(filePath);
const db = drizzle(sqlite, { schema });

async function main() {
  console.log("Seeding database...");

  // Clear existing data (reverse FK order)
  db.delete(schema.chatRoomMembers).run();
  db.delete(schema.messages).run();
  db.delete(schema.chatRooms).run();
  db.delete(schema.sessions).run();
  db.delete(schema.users).run();
  console.log("Cleared existing data.");
  sqlite.exec("DELETE FROM sqlite_sequence");

  // 1. Tworzenie podstawowych użytkowników
  const [alice] = await db
    .insert(schema.users)
    .values({
      username: "alice",
      email: "alice@example.com",
      passwordHash:
        "$2b$10$qur/2dobJwUKXoWGnIdlDOymUcEce2rEhcSZSFK1AGQ5DUlwenfmu",
      avatarUrl: null,
    })
    .returning();

  const [bob] = await db
    .insert(schema.users)
    .values({
      username: "bob",
      email: "bob@example.com",
      passwordHash:
        "$2b$10$qur/2dobJwUKXoWGnIdlDOymUcEce2rEhcSZSFK1AGQ5DUlwenfmu",
      avatarUrl: null,
    })
    .returning();

  const [charlie] = await db
    .insert(schema.users)
    .values({
      username: "charlie",
      email: "charlie@example.com",
      passwordHash:
        "$2b$10$qur/2dobJwUKXoWGnIdlDOymUcEce2rEhcSZSFK1AGQ5DUlwenfmu",
      avatarUrl: null,
    })
    .returning();

  console.log("Created core users.");

  // 2. Generowanie 35 dodatkowych roomów dla Alice
  console.log("Generating 35 rooms for Alice...");
  const rooms: (typeof schema.chatRooms.$inferSelect)[] = [];
  const membersToInsert: { userId: number; chatRoomId: number }[] = [];

  // Pokój w którym będzie 50+ wiadomości
  const [megaRoom] = await db
    .insert(schema.chatRooms)
    .values({
      name: "Alice Mega Room 🚀",
      isPrivate: false,
      type: "group",
      creatorId: alice.id,
    })
    .returning();
  rooms.push(megaRoom);
  membersToInsert.push(
    { userId: alice.id, chatRoomId: megaRoom.id },
    { userId: bob.id, chatRoomId: megaRoom.id },
  );

  // Pętla tworząca pozostałe pokoje (mix grup i DM)
  for (let i = 1; i <= 34; i++) {
    const isPrivate = i % 2 === 0;
    const type = i % 3 === 0 ? "dm" : "group";

    const [room] = await db
      .insert(schema.chatRooms)
      .values({
        name: type === "dm" ? null : `Projekt ${i} - Dyskusja`,
        isPrivate,
        type,
        creatorId: alice.id,
      })
      .returning();

    rooms.push(room);

    // Zawsze dodajemy Alice
    membersToInsert.push({ userId: alice.id, chatRoomId: room.id });
    // Losowo dodajemy Boba lub Charliego, żeby pokoje nie były puste
    if (i % i === 0 || i % 2 === 0)
      membersToInsert.push({ userId: bob.id, chatRoomId: room.id });
    if (i % i === 0 || i % 3 === 0)
      membersToInsert.push({ userId: charlie.id, chatRoomId: room.id });
  }

  // Wrzucamy wszystkich członków jednym insertem (baza odetchnie)
  db.insert(schema.chatRoomMembers).values(membersToInsert).run();
  console.log(`Created ${rooms.length} rooms and assigned members.`);

  // 3. Generowanie wiadomości
  const baseTime = new Date("2025-01-01T10:00:00.000Z");
  let messageCounter = 0;

  console.log("Generating 50+ messages for 'Alice Mega Room'...");

  // Szablony losowych tekstów, żeby czat wyglądał naturalnie
  const dummyPhrases = [
    "Jak tam projekt?",
    "Widzieliście nowy update?",
    "Musimy to przegadać.",
    "Działa to u Was?",
    "Dobra robota!",
    "Sprawdźcie wolną chwilą.",
    "Odpalam deployment 🚀",
    "Mamy buga na produkcji 🐛",
    "Kto ma czas na calla?",
    "Jasne, nie ma problemu.",
    "Zrobione!",
    "Można mergować.",
    "Dzięki za info!",
  ];
  const users = [alice, bob, charlie];

  // Generujemy 55 wiadomości w Mega Roomie
  for (let i = 0; i < 55; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomText =
      dummyPhrases[Math.floor(Math.random() * dummyPhrases.length)];
    const timeOffset = messageCounter++ * 30000; // co 30 sekund

    await db.insert(schema.messages).values({
      content: `${randomText} (Wiadomość #${i + 1})`,
      userId: randomUser.id,
      chatRoomId: megaRoom.id,
      createdAt: new Date(baseTime.getTime() + timeOffset).toISOString(),
    });
  }

  // Dodajmy po jednej startowej wiadomości do pozostałych pokoi, żeby nie świeciły pustkami
  console.log("Adding initial messages to other rooms...");
  for (const room of rooms) {
    if (room.id === megaRoom.id) continue;
    const timeOffset = messageCounter++ * 60000;

    const [insertedMsg] = await db
      .insert(schema.messages)
      .values({
        content: `Cześć! Witamy w pokoju: ${room.name ?? "Direct Message"} 👋`,
        userId: alice.id,
        chatRoomId: room.id,
        createdAt: new Date(baseTime.getTime() + timeOffset).toISOString(),
      })
      .returning();

    // Od razu aktualizujemy lastMessageAt dla tego pokoju
    db.update(schema.chatRooms)
      .set({ lastMessageAt: insertedMsg.createdAt })
      .where(eq(schema.chatRooms.id, room.id))
      .run();
  }

  // Na koniec aktualizujemy lastMessageAt dla Mega Roomu (będzie miał najświeższą datę)
  const lastMegaRoomTime = new Date(
    baseTime.getTime() + messageCounter * 30000,
  ).toISOString();
  db.update(schema.chatRooms)
    .set({ lastMessageAt: lastMegaRoomTime })
    .where(eq(schema.chatRooms.id, megaRoom.id))
    .run();

  console.log("Updated lastMessageAt for all rooms.");
  console.log("Done! ✅ Baza została pomyślnie zapełniona.");
}

main().catch(console.error);
