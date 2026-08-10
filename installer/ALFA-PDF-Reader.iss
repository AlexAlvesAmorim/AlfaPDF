; ============================================================================
;  ALFA PDF Reader 2.0 - Instalador Profissional
;  Dev de Favela - Software brasileiro de nivel profissional
;
;  Identidade visual: dark + vermelho (#e4002b) - repaint profundo Pascal
;  Autor: Alex Alves Amorim
; ============================================================================
;  Build:  ISCC.exe "ALFA-PDF-Reader.iss"
;  Saida:  ..\release\ALFA-PDF-Reader-2.0-Setup-x64.exe
; ============================================================================

#define MyAppName          "ALFA PDF Reader"
#define MyAppVersion      "2.0.0"
#define MyAppSuite        "2.0"
#define MyAppPublisher    "Alex Alves Amorim"
#define MyAppBrand        "Dev de Favela"
#define MyAppURL         "https://github.com/AlexAlvesAmorim/AlfaPDF"
#define MyAppExeName      "ALFA PDF Reader.exe"
#define MyAppCopyright    "Copyright (c) 2026 Alex Alves Amorim"
#define MyAppSourceDir    "..\release\win-unpacked"

[Setup]
; ---- Identidade --------------------------------------------------------
AppId={{C2E5F8A1-4B6D-7E9F-3A2C-8D1B5F6E0A9C}
AppName={#MyAppName} {#MyAppSuite}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppSuite}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
AppContact={#MyAppURL}
AppCopyright={#MyAppCopyright}
AppReadmeFile={#MyAppURL}
VersionInfoVersion={#MyAppVersion}.0
VersionInfoCompany={#MyAppBrand}
VersionInfoProductVersion={#MyAppVersion}.0
VersionInfoProductName={#MyAppName}
VersionInfoDescription=ALFA PDF Reader - Visualizador PDF Profissional
VersionInfoCopyright={#MyAppCopyright}
VersionInfoOriginalFileName=ALFA-PDF-Reader-2.0-Setup.exe

; ---- Arquitetura / Diretorios -----------------------------------------
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
DefaultDirName={autopf}\ALFA PDF Reader
DefaultGroupName=ALFA PDF Reader
SetupLogging=yes
UninstallLogMode=append
UninstallDisplayName=ALFA PDF Reader {#MyAppSuite}

; ---- Privilegios ------------------------------------------------------
PrivilegesRequiredOverridesAllowed=dialog
PrivilegesRequired=admin

; ---- Configuracao do instalador ----------------------------------------
ShowLanguageDialog=no
LanguageDetectionMethod=none
OutputBaseFilename=ALFA-PDF-Reader-2.0-Setup-x64
OutputDir=..\release
Compression=lzma2/ultra64
SolidCompression=yes
LZMAUseSeparateProcess=yes
DiskSpanning=no
DiskSliceSize=2147483647
MergeDuplicateFiles=yes
RestartIfNeededByRun=no
AlwaysRestart=no
CloseApplications=force
RestartApplications=no

; ---- Visual do Setup ---------------------------------------------------
WindowVisible=yes
WindowResizable=no
WizardStyle=modern
WizardResizable=no
WizardSizePercent=120,128

; ---- Assets visuais ----------------------------------------------------
SetupIconFile=assets\alfa.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
WizardImageFile=assets\sidebar.bmp
WizardSmallImageFile=assets\small.bmp
WizardImageAlphaFormat=defined

; ---- Outros -------------------------------------------------------------
LicenseFile=LICENSE.md
DisableWelcomePage=no
DisableDirPage=no
DisableProgramGroupPage=yes
DisableReadyPage=no
DisableFinishedPage=no
DisableStartupPrompt=yes
ShowComponentSizes=yes
ExtraDiskSpaceRequired=0
UsedUserAreasWarning=no

[Languages]
Name: "ptbr";  MessagesFile: "compiler:Languages\Portuguese.isl"
Name: "en";    MessagesFile: "compiler:Default.isl"

[CustomMessages]
ptbr.WelcomeLabel1=Bem-vindo ao instalador do%nALFA PDF Reader {#MyAppSuite}
ptbr.WelcomeLabel2=O visualizador PDF profissional, rapido e elegante.%n%nLeitura continua - Multiplas abas - Impressao profissional%nSuporte a senhas - Zoom inteligente - Associe seus .PDF%n%nClique em Avancar para continuar a instalacao.
ptbr.SelectDirLabel3=O instalador vai copiar o ALFA PDF Reader para a pasta selecionada.%n%nRecomendado: mantenha o caminho padrao.
ptbr.ReadyMemoDir=Diretorio de instalacao:
ptbr.ReadyMemoTasks=Tarefas adicionais:
ptbr.RunAfter=Iniciar ALFA PDF Reader agora
ptbr.BrandText=Dev de Favela - Software profissional brasileiro
ptbr.PageInstalling=Instalando ALFA PDF Reader {#MyAppSuite}
ptbr.PageInstallingSub=Extraindo arquivos e configurando componentes. Aguarde...
ptbr.StatusExtract=Extraindo nucleo do aplicativo...
ptbr.StatusReg=Registrando associacoes de arquivo...
ptbr.StatusShortcuts=Criando atalhos...
ptbr.UninstallConfirm=Tem certeza que deseja remover o ALFA PDF Reader?%n%nSeus arquivos PDF nao serao tocados, apenas o aplicativo.
en.WelcomeLabel1=Welcome to the%nALFA PDF Reader {#MyAppSuite} installer
en.WelcomeLabel2=The professional, fast and elegant PDF viewer.%n%nContinuous reading - Multiple tabs - Professional printing%nPassword support - Smart zoom - Associate your .PDF files%n%nClick Next to continue.
en.SelectDirLabel3=Setup will install ALFA PDF Reader into the selected folder.%n%nRecommended: keep the default path.
en.ReadyMemoDir=Installation directory:
en.ReadyMemoTasks=Additional tasks:
en.RunAfter=Launch ALFA PDF Reader now
en.BrandText=Dev de Favela - Brazilian professional software
en.PageInstalling=Installing ALFA PDF Reader {#MyAppSuite}
en.PageInstallingSub=Extracting files and configuring components. Please wait...
en.StatusExtract=Extracting application core...
en.StatusReg=Registering file associations...
en.StatusShortcuts=Creating shortcuts...
en.UninstallConfirm=Are you sure you want to remove ALFA PDF Reader?%n%nYour PDF files will not be touched, only the application.

[Types]
Name: "full";     Description: "Instalacao completa (recomendado)"
Name: "compact";  Description: "Instalacao compacta"
Name: "custom";   Description: "Personalizada"; Flags: iscustom

[Components]
Name: "core";  Description: "Aplicativo ALFA PDF Reader (nucleo)";  Types: full compact custom; Flags: fixed; ExtraDiskSpaceRequired: 140000000
Name: "docs";  Description: "Documentacao e licenca";              Types: full compact

[Tasks]
Name: "desktopicon"; Description: "Criar icone na Area de Trabalho"; GroupDescription: "Tarefas adicionais:"
Name: "startmenu";   Description: "Criar atalhos no Menu Iniciar";  GroupDescription: "Tarefas adicionais:"; Flags: checkedonce
Name: "pdfassoc";    Description: "Associar arquivos .pdf ao ALFA PDF Reader"; GroupDescription: "Tarefas adicionais:"
Name: "runafter";    Description: "{cm:RunAfter}";                   GroupDescription: "Tarefas adicionais:"; Flags: unchecked

[Files]
; ----- Nucleo da aplicacao (win-unpacked) -------------------------------
Source: "{#MyAppSourceDir}\*"; DestDir: "{app}"; Components: core; Flags: ignoreversion recursesubdirs createallsubdirs restartreplace uninsneveruninstall 64bit; Excludes: "unins*"
Source: "{#MyAppSourceDir}\{#MyAppExeName}"; DestDir: "{app}"; Components: core; Flags: ignoreversion restartreplace 64bit; AfterInstall: LogInstall('InstallCore')

; ----- Documentacao / licenca ------------------------------------------
Source: "LICENSE.md"; DestDir: "{app}"; Components: docs; Flags: ignoreversion isreadme
Source: "..\README.md"; DestDir: "{app}"; Components: docs; Flags: ignoreversion

[Icons]
Name: "{group}\ALFA PDF Reader";              Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#MyAppExeName}"; Comment: "Visualizador PDF profissional"; Tasks: startmenu
Name: "{group}\Desinstalar ALFA PDF Reader";   Filename: "{uninstallexe}"; Comment: "Remover o ALFA PDF Reader"
Name: "{group}\Licenca";                        Filename: "{app}\LICENSE.md"; Comment: "Termos de licenca"
Name: "{autodesktop}\ALFA PDF Reader";          Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#MyAppExeName}"; Comment: "Visualizador PDF profissional"; Tasks: desktopicon

[Registry]
; ----- Associacao .pdf (apenas se a tarefa for marcada) ----------------
Root: HKCU; Subkey: "Software\Classes\.pdf";                              ValueType: string; ValueName: "";                   ValueData: "ALFAPDFReader.File";           Flags: uninsdeletevalue; Tasks: pdfassoc
Root: HKCU; Subkey: "Software\Classes\.pdf\OpenWithList\{#MyAppExeName}";  ValueType: string; ValueName: "";                   ValueData: "";                               Flags: uninsdeletekey;  Tasks: pdfassoc
Root: HKCU; Subkey: "Software\Classes\.pdf\OpenWithProgids";               ValueType: string; ValueName: "ALFAPDFReader.File";  ValueData: "";                                Flags: uninsdeletevalue; Tasks: pdfassoc

Root: HKCU; Subkey: "Software\Classes\ALFAPDFReader.File";                  ValueType: string; ValueName: "";                   ValueData: "Documento PDF - ALFA";          Flags: uninsdeletekey;  Tasks: pdfassoc
Root: HKCU; Subkey: "Software\Classes\ALFAPDFReader.File";                  ValueType: string; ValueName: "FriendlyTypeName";   ValueData: "Documento PDF - ALFA";          Flags: uninsdeletekey;  Tasks: pdfassoc
Root: HKCU; Subkey: "Software\Classes\ALFAPDFReader.File\shell\open\command"; ValueType: string; ValueName: "";                   ValueData: """{app}\{#MyAppExeName}"" ""%1"""; Flags: uninsdeletekey;   Tasks: pdfassoc
Root: HKCU; Subkey: "Software\Classes\ALFAPDFReader.File\DefaultIcon";       ValueType: string; ValueName: "";                   ValueData: "{app}\{#MyAppExeName},0";        Flags: uninsdeletekey;   Tasks: pdfassoc

Root: HKCU; Subkey: "Software\ALFA PDF Reader"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}";          Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\ALFA PDF Reader"; ValueType: string; ValueName: "Version";     ValueData: "{#MyAppVersion}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\ALFA PDF Reader"; ValueType: string; ValueName: "Publisher";   ValueData: "{#MyAppBrand}";   Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\ALFA PDF Reader"; ValueType: dword;  ValueName: "Installed";   ValueData: "1";               Flags: uninsdeletekey

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:RunAfter}"; WorkingDir: "{app}"; Flags: nowait postinstall skipifsilent runascurrentuser unchecked; Tasks: runafter

[UninstallDelete]
Type: filesandordirs; Name: "{app}\out";   Components: core
Type: filesandordirs; Name: "{app}\logs";  Components: core
Type: filesandordirs; Name: "{localappdata}\ALFA PDF Reader\Cache"
Type: filesandordirs; Name: "{localappdata}\ALFA PDF Reader"

; ============================================================================
[Code]
// ============================================================================
// Pascal Script - Repaint profundo TEMA CLARO ALFA PDF Reader 2.0
// Corpo branco + sidebar vermelho vibrante + acentos vermelhos
// ============================================================================
var
  BrandFooter:   TNewStaticText;
  WelcomeBrand:  TNewStaticText;
  TopBar:        TPanel;

// --- Conversao Hex -> Integer -------------------------------------------
function HexToInt(const S: string): Integer;
var
  i: Integer; v: Integer; c: Char;
begin
  v := 0;
  for i := 1 to Length(S) do
  begin
    c := S[i];
    case c of
      '0'..'9': v := v * 16 + (Ord(c) - Ord('0'));
      'a','A': v := v * 16 + 10;
      'b','B': v := v * 16 + 11;
      'c','C': v := v * 16 + 12;
      'd','D': v := v * 16 + 13;
      'e','E': v := v * 16 + 14;
      'f','F': v := v * 16 + 15;
    end;
  end;
  Result := v;
end;

procedure LogInstall(const Tag: string);
begin
  Log('[ALFA] ' + Tag);
end;

// --- Aplica tema claro em paineis de "interior" pages -------------------
// Paleta:
//   branco   #FFFFFF (corpo)
//   cinza    #F5F5F7 (cards/fundo elevado)
//   texto     #1A1A1A (preto)
//   texto2    #555555 (cinza medio)
//   muted     #888888
//   red       #E4002B (acento)
//   redLight  #FF2D55
procedure ApplyThemeToInteriorPage(Page: TNewNotebookPage);
var
  i: Integer; Ctrl: TControl;
begin
  if Page = nil then Exit;
  Page.Color := HexToInt('FFFFFF');
  for i := 0 to Page.ControlCount - 1 do
  begin
    Ctrl := Page.Controls[i];
    if Ctrl is TNewStaticText then
    begin
      TNewStaticText(Ctrl).Color       := HexToInt('FFFFFF');
      TNewStaticText(Ctrl).Font.Color  := HexToInt('1A1A1A');
      TNewStaticText(Ctrl).Font.Name   := 'Segoe UI';
    end
    else if Ctrl is TLabel then
    begin
      TLabel(Ctrl).Color     := HexToInt('FFFFFF');
      TLabel(Ctrl).Font.Color := HexToInt('555555');
      TLabel(Ctrl).Font.Name  := 'Segoe UI';
    end
    else if Ctrl is TNewMemo then
    begin
      TNewMemo(Ctrl).Color      := HexToInt('F5F5F7');
      TNewMemo(Ctrl).Font.Color := HexToInt('1A1A1A');
      TNewMemo(Ctrl).Font.Name  := 'Consolas';
      TNewMemo(Ctrl).Font.Size  := 9;
    end
    else if Ctrl is TNewCheckListBox then
    begin
      TNewCheckListBox(Ctrl).Color      := HexToInt('FFFFFF');
      TNewCheckListBox(Ctrl).Font.Color := HexToInt('1A1A1A');
      TNewCheckListBox(Ctrl).Font.Name  := 'Segoe UI';
      TNewCheckListBox(Ctrl).Font.Size  := 9;
    end
    else if Ctrl is TEdit then
    begin
      TEdit(Ctrl).Color      := HexToInt('FFFFFF');
      TEdit(Ctrl).Font.Color := HexToInt('1A1A1A');
      TEdit(Ctrl).Font.Name  := 'Segoe UI';
    end
    else if Ctrl is TNewButton then
    begin
      TNewButton(Ctrl).Font.Name  := 'Segoe UI';
      TNewButton(Ctrl).Font.Color := HexToInt('1A1A1A');
      TNewButton(Ctrl).Font.Size  := 9;
    end;
  end;
end;

// --- Cria linha superior vermelha (acento fino) -------------------------
procedure CreateTopBar;
begin
  if TopBar <> nil then Exit;
  TopBar := TPanel.Create(WizardForm);
  TopBar.Parent := WizardForm.MainPanel;
  TopBar.Align  := alTop;
  TopBar.Height := ScaleY(3);
  TopBar.BevelOuter := bvNone;
  TopBar.Color := HexToInt('E4002B');
end;

// --- Aplica o tema claro na WizardForm principal -----------------------
procedure ApplyMainTheme;
begin
  WizardForm.Caption := 'ALFA PDF Reader 2.0 - Instalador';

  // Fundo principal BRANCO
  WizardForm.Color              := HexToInt('FFFFFF');
  WizardForm.MainPanel.Color    := HexToInt('FFFFFF');
  WizardForm.InnerPage.Color    := HexToInt('FFFFFF');
  WizardForm.WelcomePage.Color  := HexToInt('FFFFFF');
  WizardForm.FinishedPage.Color := HexToInt('FFFFFF');

  // Bevel padrao oculto (linha cinza chata)
  WizardForm.Bevel.Visible := False;

  // Welcome labels - texto escuro sobre branco
  WizardForm.WelcomeLabel1.Font.Name  := 'Segoe UI Semibold';
  WizardForm.WelcomeLabel1.Font.Color := HexToInt('1A1A1A');
  WizardForm.WelcomeLabel1.Font.Size  := 20;
  WizardForm.WelcomeLabel1.Font.Style := [fsBold];
  WizardForm.WelcomeLabel1.Color      := HexToInt('FFFFFF');

  WizardForm.WelcomeLabel2.Font.Name  := 'Segoe UI';
  WizardForm.WelcomeLabel2.Font.Color := HexToInt('555555');
  WizardForm.WelcomeLabel2.Font.Size  := 10;
  WizardForm.WelcomeLabel2.Color      := HexToInt('FFFFFF');

  // Header das paginas interiores
  WizardForm.PageNameLabel.Font.Name   := 'Segoe UI Semibold';
  WizardForm.PageNameLabel.Font.Color  := HexToInt('1A1A1A');
  WizardForm.PageNameLabel.Font.Size   := 12;
  WizardForm.PageNameLabel.Font.Style  := [fsBold];
  WizardForm.PageDescriptionLabel.Font.Name  := 'Segoe UI';
  WizardForm.PageDescriptionLabel.Font.Color := HexToInt('E4002B');
  WizardForm.PageDescriptionLabel.Font.Style := [fsItalic];
  WizardForm.PageDescriptionLabel.Font.Size  := 10;

  // Labels de SelectDir
  WizardForm.SelectDirLabel.Font.Color              := HexToInt('1A1A1A');
  WizardForm.SelectDirLabel.Font.Name               := 'Segoe UI';
  WizardForm.SelectDirLabel.Font.Size              := 10;
  WizardForm.SelectDirBrowseLabel.Font.Color        := HexToInt('555555');
  WizardForm.SelectDirBrowseLabel.Font.Name        := 'Segoe UI';
  WizardForm.DiskSpaceLabel.Font.Color              := HexToInt('E4002B');
  WizardForm.DiskSpaceLabel.Font.Name               := 'Consolas';
  WizardForm.SelectDirBitmapImage.BackColor         := HexToInt('FFFFFF');

  // ReadyMemo - card cinza-claro com texto escuro
  WizardForm.ReadyMemo.Font.Name  := 'Consolas';
  WizardForm.ReadyMemo.Font.Size  := 9;
  WizardForm.ReadyMemo.Color       := HexToInt('F5F5F7');
  WizardForm.ReadyMemo.Font.Color := HexToInt('1A1A1A');

  // LicenseMemo - mesma estetica
  WizardForm.LicenseMemo.Font.Name  := 'Consolas';
  WizardForm.LicenseMemo.Font.Size  := 9;
  WizardForm.LicenseMemo.Color       := HexToInt('F5F5F7');
  WizardForm.LicenseMemo.Font.Color := HexToInt('1A1A1A');
  WizardForm.LicenseAcceptedRadio.Font.Color    := HexToInt('1A1A1A');
  WizardForm.LicenseAcceptedRadio.Font.Name    := 'Segoe UI';
  WizardForm.LicenseNotAcceptedRadio.Font.Color := HexToInt('1A1A1A');
  WizardForm.LicenseNotAcceptedRadio.Font.Name := 'Segoe UI';

  // Finished page
  WizardForm.FinishedHeadingLabel.Font.Name   := 'Segoe UI Semibold';
  WizardForm.FinishedHeadingLabel.Font.Color  := HexToInt('1A1A1A');
  WizardForm.FinishedHeadingLabel.Font.Size   := 18;
  WizardForm.FinishedHeadingLabel.Font.Style  := [fsBold];
  WizardForm.FinishedLabel.Font.Name  := 'Segoe UI';
  WizardForm.FinishedLabel.Font.Color := HexToInt('555555');
  WizardForm.FinishedLabel.Font.Size  := 10;

  // Page de progresso - texto sobre branco
  WizardForm.FileNameLabel.Font.Name  := 'Consolas';
  WizardForm.FileNameLabel.Font.Color := HexToInt('888888');
  WizardForm.FileNameLabel.Font.Size  := 8;
  WizardForm.StatusLabel.Font.Name   := 'Segoe UI';
  WizardForm.StatusLabel.Font.Color  := HexToInt('1A1A1A');
  WizardForm.StatusLabel.Font.Size   := 10;

  // Botoes - texto escuro
  WizardForm.BackButton.Font.Name    := 'Segoe UI';
  WizardForm.BackButton.Font.Size    := 9;
  WizardForm.NextButton.Font.Name    := 'Segoe UI';
  WizardForm.NextButton.Font.Size    := 9;
  WizardForm.NextButton.Font.Style   := [fsBold];
  WizardForm.CancelButton.Font.Name  := 'Segoe UI';
  WizardForm.CancelButton.Font.Size  := 9;

  // Sidebar vermelho vibrante - estica pra preencher a altura
  WizardForm.WizardBitmapImage.Align   := alRight;
  WizardForm.WizardBitmapImage.Stretch  := True;
  WizardForm.WizardBitmapImage.Center   := True;

  CreateTopBar;
end;

procedure InitializeWizard;
begin
  ApplyMainTheme;

  // Footer discreto cinza embaixo
  BrandFooter := TNewStaticText.Create(WizardForm);
  BrandFooter.Parent := WizardForm;
  BrandFooter.Top    := WizardForm.ClientHeight - ScaleY(14);
  BrandFooter.Left   := ScaleX(24);
  BrandFooter.Font.Name  := 'Segoe UI';
  BrandFooter.Font.Size  := 7;
  BrandFooter.Font.Color := HexToInt('AAAAAA');
  BrandFooter.Caption := 'Dev de Favela   -   ALFA PDF Reader 2.0   -   (c) 2026 Alex Alves Amorim';
end;

procedure CurWizardPageChanged(CurPageID: Integer);
begin
  ApplyMainTheme;

  // Reaplica tema claro nas paginas interiores
  case CurPageID of
    wpSelectDir:           ApplyThemeToInteriorPage(WizardForm.SelectDirPage);
    wpSelectComponents:    ApplyThemeToInteriorPage(WizardForm.SelectComponentsPage);
    wpSelectTasks:         ApplyThemeToInteriorPage(WizardForm.SelectTasksPage);
    wpReady:               ApplyThemeToInteriorPage(WizardForm.ReadyPage);
    wpInstalling:          ApplyThemeToInteriorPage(WizardForm.InstallingPage);
    wpFinished:            ApplyThemeToInteriorPage(WizardForm.FinishedPage);
  end;

  // Welcome page: brand embaixo do subtitulo (vermelho discreto)
  if CurPageID = wpWelcome then
  begin
    WelcomeBrand := TNewStaticText.Create(WizardForm);
    WelcomeBrand.Parent := WizardForm.WelcomePage;
    WelcomeBrand.Top    := WizardForm.WelcomeLabel2.Top + WizardForm.WelcomeLabel2.Height + ScaleY(14);
    WelcomeBrand.Left   := ScaleX(28);
    WelcomeBrand.Width  := WizardForm.WelcomePage.Width - ScaleX(220);
    WelcomeBrand.Font.Name  := 'Segoe UI';
    WelcomeBrand.Font.Size  := 9;
    WelcomeBrand.Font.Style := [fsBold];
    WelcomeBrand.Font.Color := HexToInt('E4002B');
    WelcomeBrand.Caption   := 'Dev de Favela  -  Software profissional brasileiro';
    WelcomeBrand.Color := HexToInt('FFFFFF');
  end;

  // Sidebar maior em welcome/finished (presenca forte), um pouco menor nas interiores
  if (CurPageID = wpWelcome) or (CurPageID = wpFinished) then
    WizardForm.WizardBitmapImage.Width := ScaleX(180)
  else
    WizardForm.WizardBitmapImage.Width := ScaleX(170);
end;

// --- Atualiza label de status durante a instalacao -----------------------
procedure CurInstallProgressChanged(CurProgress: Integer; MaxProgress: Integer);
var
  Pct: Integer;
begin
  if MaxProgress > 0 then
    Pct := (CurProgress * 100) div MaxProgress
  else
    Pct := 0;
  WizardForm.StatusLabel.Caption := ExpandConstant('{cm:PageInstallingSub}');
  WizardForm.FileNameLabel.Caption := IntToStr(Pct) + '%   -   ' + ExpandConstant('{cm:PageInstalling}');
end;

// --- Custom Ready Memo (card estilizado) --------------------------------
function UpdateReadyMemo(Space, NewLine, MemoUserInfoInfo, MemoDirInfo, MemoTypeInfo, MemoComponentsInfo, MemoGroupInfo, MemoTasksInfo: String): String;
var
  S: String;
begin
  S := '';
  S := S + 'Dev de Favela   -   ALFA PDF Reader 2.0' + NewLine;
  S := S + '------------------------------------------------' + NewLine + NewLine;
  S := S + ExpandConstant('{cm:ReadyMemoDir}')    + NewLine + Space + MemoDirInfo   + NewLine + NewLine;
  S := S + ExpandConstant('{cm:ReadyMemoTasks}')  + NewLine + Space + MemoTasksInfo + NewLine;
  Result := S;
end;

// --- Skip na pagina de componentes (full e default) --------------------
function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := (PageID = wpSelectComponents);
end;

// --- Hook de instalacao -------------------------------------------------
function InitializeSetup(): Boolean;
begin
  Result := True;
  LogInstall('InitializeSetup');
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
    LogInstall('Installing');
  if CurStep = ssPostInstall then
    LogInstall('InstallConcluido');
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usUninstall then
    LogInstall('Uninstalling');
  if CurUninstallStep = usPostUninstall then
    LogInstall('UninstallConcluido');
end;
