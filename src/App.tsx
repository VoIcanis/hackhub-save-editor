import { AppShell, Burger, Group, Text, NavLink, Stack, Container, Button, ScrollArea, useMantineColorScheme, Paper, Menu, Select, Table, NumberInput, Modal, Badge, ActionIcon, Title, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CodeHighlight, CodeHighlightAdapterProvider, createHighlightJsAdapter } from '@mantine/code-highlight';
import hljs from 'highlight.js';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { IconDownload, IconPencil, IconBuildingBank } from '@tabler/icons-react';

interface AppStoreData {
  purchasedItems: string[];
  unlockedMarketItems: string[];
}

interface SaveFileData {
  AppStore: AppStoreData;
  Bank: Record<string, any>;
  Quests: any[];
  Terminal: Record<string, any>;
  Suspicion: number;
  [key: string]: any; 
}

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [saveData, setSaveData] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [activeView, setActiveView] = useState<'raw' | 'bank'>('raw');
  const [editingAccount, setEditingAccount] = useState<{index: number, data: any} | null>(null);
  const [loading, setLoading] = useState(false);
  const { colorScheme } = useMantineColorScheme();

  const handleOpen = async () => {
    setLoading(true);
    try {
      const data = await invoke<SaveFileData>('load_save_file');
      setSaveData(data);

      const keys = Object.keys(data);
      if (keys.length > 0) {
        const firstKey = keys[0];
        setSelectedSection(firstKey);
        setCurrentData(data[firstKey]); 
      }
    } catch (err) {
      console.error("Rust Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'hhsav' | 'json') => {
  if (!saveData) return;

  setLoading(true);
  try {
    const command = format === 'hhsav' ? 'save_hhsav_file' : 'save_json_file';
    const name = `hackhub_${format === 'hhsav' ? 'edited' : 'raw'}_${new Date().getTime()}.${format}`;
    const message = await invoke(command, { data: saveData, suggestedName: name });
    console.log(message);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} style={{ letterSpacing: '1px' }}>HackHub Save Editor</Text>
          </Group>
          
          <Button.Group>
            {saveData && 
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button size="xs" variant="filled" color="blue" rightSection={<IconDownload size={14} />}>Download File</Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item onClick={() => handleExport("json")} leftSection={<IconDownload size={14} />}>
                    Export Raw (.json)
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    onClick={() => handleExport("hhsav")}
                    leftSection={<IconDownload size={14} />}
                  >
                    Export Save (.hhsav)
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            }
            <Button onClick={handleOpen} loading={loading} size="xs" variant={saveData ? "light":"filled"} color="blue">
              {saveData ? "Change File" : "Load Save (.hhsav)"}
            </Button>
          </Button.Group>
          
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <NavLink label="Raw Data View" disabled={!saveData} active={activeView === 'raw'} onClick={() => setActiveView('raw')} />
          <NavLink label="Bank Accounts" disabled={!saveData} active={activeView === 'bank'} onClick={() => setActiveView('bank')} />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container fluid h={saveData ? "calc(100vh - 100px)" : "calc(100vh - 130px)"}>
          {!saveData ? (
            <Stack align="center" mt="xl">
              <Text c="dimmed">No save file loaded. Click 'Load Save' in the top right.</Text>
            </Stack>
          ) : (
            <>
              {/* RAW VIEW */}
              {activeView === 'raw' && (
                <Stack h="100%" gap="xs">
                  <Select
                    placeholder="Pick a section"
                    value={selectedSection}
                    data={saveData ? Object.keys(saveData) : []}
                    onChange={(value) => {
                      if (value && saveData) {
                        setSelectedSection(value);
                        setCurrentData(saveData[value]);
                      }
                    }}
                  />
                  <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                    <ScrollArea h="100%">
                      <CodeHighlightAdapterProvider adapter={createHighlightJsAdapter(hljs)}>
                        <CodeHighlight
                          code={JSON.stringify(currentData, null, 2)}
                          language="json"
                          copyLabel="Copy JSON"
                          copiedLabel="Copied!"
                          withCopyButton={true}
                          radius="md"
                          codeColorScheme={colorScheme}
                        />
                      </CodeHighlightAdapterProvider>
                    </ScrollArea>
                  </Paper>
                </Stack>
              )}

              {/* BANK ACCOUNTS VIEW */}
              {activeView === 'bank' && saveData?.Bank && (
                <Paper withBorder radius="md" p="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                  <Group justify="space-between" mb="md">
                    <Title order={4}>Bank Accounts</Title>
                    <Badge size="lg" variant="light" leftSection={<IconBuildingBank size={14}/>}>
                      {saveData.Bank.accounts.length} Total Accounts
                    </Badge>
                  </Group>

                  <ScrollArea flex={1}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Account Holder</Table.Th>
                          <Table.Th>Provider</Table.Th>
                          <Table.Th>Balance</Table.Th>
                          <Table.Th>IBAN</Table.Th>
                          <Table.Th />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {saveData.Bank.accounts.map((account: any, index: number) => (
                          <Table.Tr key={account.id || index}>
                            <Table.Td>
                              <Group gap="sm">
                                <Text size="sm" fw={500}>{account.accountName || account.fullName || 'Unknown'}</Text>
                                {account.isMine && <Badge size="xs" color="blue">Primary</Badge>}
                              </Group>
                            </Table.Td>
                            <Table.Td><Text size="xs" c="dimmed">{account.provider || 'N/A'}</Text></Table.Td>
                            <Table.Td>
                              <Text size="sm" fw={700} c={account.balance > 0 ? 'green' : 'red'}>
                                ${account.balance.toLocaleString()}
                              </Text>
                            </Table.Td>
                            <Table.Td><Text size="xs" ff="monospace" c="dimmed">{account.IBAN}</Text></Table.Td>
                            <Table.Td>
                              <ActionIcon 
                                variant="subtle" 
                                color="blue" 
                                onClick={() => setEditingAccount({ index, data: { ...account } })}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>

                  {/* EDIT MODAL */}
                  <Modal 
                    opened={editingAccount !== null} 
                    onClose={() => setEditingAccount(null)}
                    title="Edit Bank Account"
                    centered
                  >
                    {editingAccount && (
                      <Stack>
                        <TextInput 
                          label="Account Name" 
                          value={editingAccount.data.accountName || ''} 
                          onChange={(e) => setEditingAccount({
                            ...editingAccount, 
                            data: { ...editingAccount.data, accountName: e.target.value }
                          })}
                        />
                        <NumberInput 
                          label="Balance" 
                          prefix="$"
                          value={editingAccount.data.balance}
                          onChange={(val) => setEditingAccount({
                            ...editingAccount, 
                            data: { ...editingAccount.data, balance: Number(val) }
                          })}
                        />
                        <Button onClick={() => {
                          const updated = [...saveData.Bank.accounts];
                          updated[editingAccount.index] = editingAccount.data;
                          setSaveData({ ...saveData, Bank: { ...saveData.Bank, accounts: updated } });
                          setEditingAccount(null);
                        }}>
                          Save Changes
                        </Button>
                      </Stack>
                    )}
                  </Modal>
                </Paper>
              )}
            </>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;